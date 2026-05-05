import { NextResponse } from 'next/server';
import { getGroupsCollection } from '@/lib/mongodb';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupsCol = await getGroupsCollection();
    const groups = await groupsCol.find({ userId: user.id }).sort({ createdAt: 1 }).toArray();

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const groupsCol = await getGroupsCollection();
    const newGroup = {
      userId: user.id,
      name,
      createdAt: new Date(),
    };

    const result = await groupsCol.insertOne(newGroup);
    newGroup._id = result.insertedId;

    return NextResponse.json({ message: 'Group created successfully', group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error.message },
      { status: 500 }
    );
  }
}
