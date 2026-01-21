// app/api/reminders/route.js
import { NextResponse } from 'next/server';
import { getSubmissionsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET active reminders
export async function GET() {
  try {
    const submissionsCol = await getSubmissionsCollection();
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const reminders = await submissionsCol
      .find({
        reminderDate: { $lte: today },
        reminderCompleted: false
      })
      .sort({ reminderDate: 1 })
      .toArray();
    
    return NextResponse.json({ reminders });
    
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// PATCH - Update reminder status
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, action, newDate } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID and action are required' },
        { status: 400 }
      );
    }
    
    const submissionsCol = await getSubmissionsCollection();
    
    if (action === 'complete') {
      await submissionsCol.updateOne(
        { _id: new ObjectId(id) },
        { $set: { reminderCompleted: true } }
      );
    } else if (action === 'reschedule' && newDate) {
      await submissionsCol.updateOne(
        { _id: new ObjectId(id) },
        { $set: { reminderDate: new Date(newDate) } }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing newDate' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Reminder updated successfully',
      success: true 
    });
    
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}