import { NextResponse } from 'next/server';
import { getListsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const listsCol = await getListsCollection();
    const list = await listsCol.findOne({ _id: new ObjectId(id), userId: user.id });

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const { title, questions } = body;

    const updateData = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (questions !== undefined) updateData.questions = questions;

    const listsCol = await getListsCollection();
    const result = await listsCol.findOneAndUpdate(
      { _id: new ObjectId(id), userId: user.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'List updated successfully', list: result });
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const listsCol = await getListsCollection();
    const result = await listsCol.deleteOne({ _id: new ObjectId(id), userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Failed to delete list', details: error.message },
      { status: 500 }
    );
  }
}
