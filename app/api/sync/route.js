// app/api/sync/route.js
import { NextResponse } from 'next/server';
import { getQuestionsCollection, getSubmissionsCollection, getUsersCollection } from '@/lib/mongodb';
import { unixToIST } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCol = await getUsersCollection();
    const dbUser = await usersCol.findOne({ clerkId: user.id });

    if (!dbUser || !dbUser.leetcodeUsername) {
      return NextResponse.json({ error: 'LeetCode username not found. Please complete onboarding.' }, { status: 400 });
    }

    // Fetch from LeetCode API
    console.log(dbUser)
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${dbUser.leetcodeUsername}/acSubmission?limit=20`
    );
   
    if (!response.ok) {
      throw new Error('Failed to fetch from LeetCode API');
    }
    
    const data = await response.json();
    console.log(data)
    const submissions = data.submission || [];
    // console.log(submissions)
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
      
      // Check if this exact submission already exists for this user
      const existingSubmission = await submissionsCol.findOne({
        titleSlug: sub.titleSlug,
        timestamp: timestamp,
        userId: user.id
      });
      
      if (existingSubmission) {
        continue; // Skip duplicate
      }
      
      // Check if question exists (shared cache of problem metadata)
      // We upsert purely to ensure we have the title/slug mapping available
      await questionsCol.updateOne(
        { titleSlug: sub.titleSlug },
        { 
          $set: { 
            title: sub.title,
            updatedAt: new Date()
          },
          $addToSet: { languages: sub.lang } // Generic pool of languages used
        },
        { upsert: true }
      );
      
      const isFirstSolveForUser = await submissionsCol.countDocuments({
        titleSlug: sub.titleSlug,
        userId: user.id
      }) === 0;

      // Auto-complete any pending reminders for this problem
      if (!isFirstSolveForUser) {
          await submissionsCol.updateMany(
            {
              userId: user.id,
              titleSlug: sub.titleSlug,
              reminderDate: { $lte: timestamp }, // Due before or on this solve time
              reminderCompleted: false
            },
            {
              $set: { 
                reminderCompleted: true,
                completedAt: timestamp 
              }
            }
          );
      }

      // Insert submission
      const submissionDoc = {
        userId: user.id, // Link to Clerk User
        titleSlug: sub.titleSlug,
        title: sub.title,
        timestamp: timestamp,
        lang: sub.lang,
        solveType: "new",
        notes: null,
        reminderDate: null,
        reminderCompleted: false,
        isFirstSolve: isFirstSolveForUser,
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