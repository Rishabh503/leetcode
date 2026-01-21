// app/api/submissions/route.js
import { NextResponse } from 'next/server';
import { getSubmissionsCollection, getQuestionsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET submissions with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const solveType = searchParams.get('solveType');
    const needsMetadata = searchParams.get('needsMetadata');
    
    const submissionsCol = await getSubmissionsCollection();
    
    const query = {};
    
    // Filter by date range
    if (startDate || endDate) {
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
    
    const submissions = await submissionsCol
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();
    
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
    const body = await request.json();
    const { id, solveType, questionNumber, questionLink,notes, reminderDate } = body;
    
   if (!id) {
  return NextResponse.json({ error: 'ID required' }, { status: 400 });
}

    
    // if(!questionLink){
    //    return NextResponse.json(
    //     { error: 'Quesition Link is required' },
    //     { status: 400 }
    //   ); 
    // }
    
    
    // if(!questionNumber){
    //    return NextResponse.json(
    //     { error: 'Quesition Number is required' },
    //     { status: 400 }
    //   ); 
    // }


    const submissionsCol = await getSubmissionsCollection();
    const questionsCol = await getQuestionsCollection();
    
    const updateData = {
      solveType,
      notes: notes || null,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      questionLink:questionLink,
      questionNumber: parseInt(questionNumber) 
    };
    
    // Update submission
    const result = await submissionsCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Update question number if provided
    if (questionNumber) {
      const submission = await submissionsCol.findOne({ _id: new ObjectId(id) });
      await questionsCol.updateOne(
        { titleSlug: submission.titleSlug },
        { $set: { questionNumber: parseInt(questionNumber) } }
      );
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