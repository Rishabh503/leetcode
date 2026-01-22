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

    // 1. Fetch & Update Global Stats (for Dashboard Overview)
    try {
      const statsRes = await fetch(`https://alfa-leetcode-api.onrender.com/${dbUser.leetcodeUsername}/solved`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        await usersCol.updateOne(
           { _id: dbUser._id },
           { $set: { leetcodeStats: statsData, lastStatsSync: new Date() } }
        );
      }
    } catch (err) {
      console.error("Failed to fetch user stats", err);
    }

    // 2. Fetch Recent AC Submissions (for Tracking)
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
      
      // Fetch problem details for difficulty if we don't have it cached (or just refresh it)
      // Fetch problem details for difficulty if we don't have it cached (or just refresh it)
      let difficulty = null;
      let topicTags = [];
      let questionNumber = null;

      try {
         // We can optimize this by checking if we already have the difficulty in questionsCol, 
         // but for now, we'll fetch to be sure. Rate limiting might be a concern, but for 20 items it's likely fine.
         const problemRes = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${sub.titleSlug}`);
         if (problemRes.ok) {
             const problemData = await problemRes.json();
             // API structure might vary, handle likely paths
             difficulty = problemData.difficulty || problemData.question?.difficulty || null;
             topicTags = problemData.topicTags || problemData.question?.topicTags || [];
             questionNumber = problemData.questionFrontendId ? parseInt(problemData.questionFrontendId) : null;
         }
      } catch (err) {
         console.error("Failed to fetch difficulty for", sub.titleSlug, err);
      }

      // Check if question exists (shared cache of problem metadata)
      // We upsert purely to ensure we have the title/slug mapping available
      await questionsCol.updateOne(
        { titleSlug: sub.titleSlug },
        { 
          $set: { 
            title: sub.title,
            difficulty: difficulty, // Store difficulty
            topicTags: topicTags, // Store topic tags
            questionNumber: questionNumber,
            questionLink: `https://leetcode.com/problems/${sub.titleSlug}`,
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

      // Auto-complete logic removed as per user request (reminders must be manually marked)
      // if (!isFirstSolveForUser) { ... }

      // Insert submission
      const submissionDoc = {
        userId: user.id, // Link to Clerk User
        titleSlug: sub.titleSlug,
        title: sub.title,
        timestamp: timestamp,
        lang: sub.lang,
        solveType: "new",
        difficulty: difficulty, // Will be enriched from 'questions' collection, but good to have fallback
        questionNumber: questionNumber,
        questionLink: `https://leetcode.com/problems/${sub.titleSlug}`,
        topicTags: topicTags,
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