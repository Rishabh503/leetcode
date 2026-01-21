// components/ReminderSection.js
'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';

export default function ReminderSection({ reminders, onUpdate }) {
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');

  const handleComplete = async (id) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'complete' })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Complete reminder error:', error);
    }
  };

  const handleReschedule = async (id) => {
    if (!newDate) return;

    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reschedule', newDate })
      });

      if (response.ok) {
        setRescheduleId(null);
        setNewDate('');
        onUpdate();
      }
    } catch (error) {
      console.error('Reschedule reminder error:', error);
    }
  };

  if (!reminders || reminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
        <span>🔔</span> Active Reminders ({reminders.length})
      </h2>
      
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div 
            key={reminder._id} 
            className="bg-white rounded-md p-3 shadow-sm border border-orange-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{reminder.title}</p>
                <p className="text-sm text-gray-600">
                  Due: {formatDate(reminder.reminderDate)}
                </p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                {reminder.lang}
              </span>
            </div>

            {reminder.notes && (
              <p className="text-sm text-gray-700 mb-2 italic">{reminder.notes}</p>
            )}

            {rescheduleId === reminder._id.toString() ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleReschedule(reminder._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setRescheduleId(null);
                    setNewDate('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleComplete(reminder._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  ✓ Done
                </button>
                <button
                  onClick={() => setRescheduleId(reminder._id.toString())}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}