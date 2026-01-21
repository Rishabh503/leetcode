// app/api/submissions/route.js
import { NextResponse } from 'next/server';
import { getSubmissionsCollection, getQuestionsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';

// GET submissions with filters
export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const solveType = searchParams.get('solveType');
    const pendingReminders = searchParams.get('pendingReminders');
    const mode = searchParams.get('mode'); // 'submissions' (default) or 'reminders'
    const needsMetadata = searchParams.get('needsMetadata');
    
    const submissionsCol = await getSubmissionsCollection();
    
    const query = { userId: user.id };
    
    // Special mode: Fetch pending reminders (overdue or due now/today)
    if (pendingReminders === 'true') {
      const targetDate = searchParams.get('targetDate');
      // If targetDate provided (e.g., end of today), use it. Else use current time.
      const compareDate = targetDate ? new Date(targetDate) : new Date();
      
      query.reminderDate = { $lte: compareDate };
      query.reminderCompleted = false;
    }
    // Mode: Reminders (Fetch reminders due in a specific range)
    else if (mode === 'reminders' && (startDate || endDate)) {
      query.reminderDate = {};
      if (startDate) query.reminderDate.$gte = new Date(startDate);
      if (endDate) query.reminderDate.$lte = new Date(endDate);
    } 
    // Normal mode: Date range filters on submission timestamp
    else if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Filter by solve type
    if (solveType && solveType !== 'all') {
      query.solveType = solveType;
    }
    
    // Filter submissions without metadata
    if (needsMetadata === 'true') {
      query.solveType = null;
    }
    
    const submissions = await submissionsCol.aggregate([
      { $match: query },
      { $sort: { timestamp: -1 } },
      {
        $lookup: {
          from: "questions",
          localField: "titleSlug",
          foreignField: "titleSlug",
          as: "questionData"
        }
      },
      {
        $addFields: {
          difficulty: { 
            $ifNull: [ "$difficulty", { $arrayElemAt: ["$questionData.difficulty", 0] } ] 
          },
          questionNumber: { 
            $ifNull: [ "$questionNumber", { $arrayElemAt: ["$questionData.questionNumber", 0] } ] 
          },
          topicTags: {
            $ifNull: [ "$topicTags", { $arrayElemAt: ["$questionData.topicTags", 0] } ]
          }
        }
      },
      { $project: { questionData: 0 } }
    ]).toArray();
    
    return NextResponse.json({ submissions });
    
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// PATCH - Update submission metadata
export async function PATCH(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, solveType, questionNumber, questionLink, notes, reminderDate, reminderCompleted, difficulty, topicTags } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const submissionsCol = await getSubmissionsCollection();
    const questionsCol = await getQuestionsCollection();
    
    const updateData = {};
    if (solveType !== undefined) updateData.solveType = solveType;
    if (questionLink !== undefined) updateData.questionLink = questionLink;
    if (questionNumber !== undefined) updateData.questionNumber = parseInt(questionNumber);
    if (typeof reminderCompleted === 'boolean') updateData.reminderCompleted = reminderCompleted;
    
    // Only update nullable fields if they are explicitly provided in the request
    // This prevents clearing 'notes' or 'reminderDate' when just refreshing metadata
    if (notes !== undefined) {
       updateData.notes = notes;
    }
    
    if (reminderDate !== undefined) {
       // If null was passed, clear it. If a date string, parse it.
       updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;
    }
    
    // Update submission ensuring it belongs to user
    const result = await submissionsCol.updateOne(
      { _id: new ObjectId(id), userId: user.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update question metadata (number, difficulty, tags) if provided
    if (questionNumber || difficulty || topicTags) {
      const submission = await submissionsCol.findOne({ _id: new ObjectId(id) });
      if (submission) {
        const questionUpdate = {};
        if (questionNumber) questionUpdate.questionNumber = parseInt(questionNumber);
        if (difficulty) questionUpdate.difficulty = difficulty;
        if (topicTags) questionUpdate.topicTags = topicTags;
        questionUpdate.updatedAt = new Date();

        await questionsCol.updateOne(
          { titleSlug: submission.titleSlug },
          { $set: questionUpdate }
        );
      }
    }
    
    return NextResponse.json({ 
      message: 'Submission updated successfully',
      success: true 
    });
    
  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}