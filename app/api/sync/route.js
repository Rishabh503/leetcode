// app/api/sync/route.js
import { NextResponse } from 'next/server';
import { getQuestionsCollection, getSubmissionsCollection } from '@/lib/mongodb';
import { unixToIST } from '@/lib/utils';

export async function POST() {
  try {
    // Fetch from LeetCode API
    const response = await fetch(
      'https://alfa-leetcode-api.onrender.com/Rishabh2906/acSubmission?limit=20'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from LeetCode API');
    }
    
    const data = await response.json();
    const submissions = data.submission || [];
    
    // Filter only Accepted submissions
    const acceptedSubmissions = submissions.filter(
      sub => sub.statusDisplay === 'Accepted'
    );
    
    if (acceptedSubmissions.length === 0) {
      return NextResponse.json({ 
        message: 'No new accepted submissions found',
        newSubmissions: []
      });
    }
    
    const questionsCol = await getQuestionsCollection();
    const submissionsCol = await getSubmissionsCollection();
    
    const newSubmissions = [];
    
    for (const sub of acceptedSubmissions) {
      const timestamp = unixToIST(sub.timestamp);
      
      // Check if this exact submission already exists
      const existingSubmission = await submissionsCol.findOne({
        titleSlug: sub.titleSlug,
        timestamp: timestamp
      });
      
      if (existingSubmission) {
        continue; // Skip duplicate
      }
      
      // Check if question exists
      const existingQuestion = await questionsCol.findOne({
        titleSlug: sub.titleSlug
      });
      
      const isFirstSolve = !existingQuestion;
      
      // Update or create question document
      if (isFirstSolve) {
        await questionsCol.insertOne({
          titleSlug: sub.titleSlug,
          title: sub.title,
          questionNumber: null,
          firstSolvedAt: timestamp,
          lastSolvedAt: timestamp,
          totalSolves: 1,
          languages: [sub.lang],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        await questionsCol.updateOne(
          { titleSlug: sub.titleSlug },
          {
            $set: {
              lastSolvedAt: timestamp,
              updatedAt: new Date()
            },
            $inc: { totalSolves: 1 },
            $addToSet: { languages: sub.lang }
          }
        );
      }
      
      // Insert submission (without metadata - user will add later)
      const submissionDoc = {
        titleSlug: sub.titleSlug,
        title: sub.title,
        timestamp: timestamp,
        lang: sub.lang,
        solveType: "new", // To be filled by user
        notes: null,
        reminderDate: null,
        reminderCompleted: false,
        isFirstSolve: isFirstSolve,
        createdAt: new Date()
      };
      
      await submissionsCol.insertOne(submissionDoc);
      newSubmissions.push(submissionDoc);
    }
    
    return NextResponse.json({
      message: `Successfully synced ${newSubmissions.length} new submissions`,
      newSubmissions: newSubmissions
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync submissions', details: error.message },
      { status: 500 }
    );
  }
}