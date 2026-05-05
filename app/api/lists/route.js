import { NextResponse } from 'next/server';
import { getListsCollection } from '@/lib/mongodb';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listsCol = await getListsCollection();
    const lists = await listsCol.find({ userId: user.id }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists', details: error.message },
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
    const { title, groupId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const listsCol = await getListsCollection();
    const newList = {
      userId: user.id,
      title,
      groupId: groupId || null,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await listsCol.insertOne(newList);
    newList._id = result.insertedId;

    return NextResponse.json({ message: 'List created successfully', list: newList });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list', details: error.message },
      { status: 500 }
    );
  }
}
