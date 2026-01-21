// app/api/questions/route.js
import { NextResponse } from 'next/server';
import { getQuestionsCollection, getSubmissionsCollection } from '@/lib/mongodb';

// GET question details with submission history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleSlug = searchParams.get('titleSlug');
    
    if (!titleSlug) {
      return NextResponse.json(
        { error: 'titleSlug is required' },
        { status: 400 }
      );
    }
    
    const questionsCol = await getQuestionsCollection();
    const submissionsCol = await getSubmissionsCollection();
    
    const question = await questionsCol.findOne({ titleSlug });
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    const submissions = await submissionsCol
      .find({ titleSlug })
      .sort({ timestamp: -1 })
      .toArray();
    
    return NextResponse.json({ 
      question,
      submissions 
    });
    
  } catch (error) {
    console.error('Get question error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question details' },
      { status: 500 }
    );
  }
}