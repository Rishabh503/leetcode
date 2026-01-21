import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leetcodeUsername } = await request.json();

    if (!leetcodeUsername) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const usersCol = await getUsersCollection();
    
    // Check if this leetcode username is already taken by another user? 
    // Usually ok to allow multiples, but let's stick to simple logic: link to this Clerk ID.
    
    await usersCol.updateOne(
      { clerkId: user.id },
      { 
        $set: { 
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
          leetcodeUsername: leetcodeUsername,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCol = await getUsersCollection();
    const dbUser = await usersCol.findOne({ clerkId: user.id });

    if (!dbUser) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ 
      exists: true, 
      leetcodeUsername: dbUser.leetcodeUsername 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
