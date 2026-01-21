'use client';

import { useState } from 'react';

export default function ReminderForm({ submission, onClose, onSave }) {
  const [reminderDate, setReminderDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reminderDate) return alert('Please select a date');

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submission._id,
          reminderDate,
          solveType: submission.solveType || 'revision',
        }),
      });

      if (!res.ok) throw new Error();

      onSave();
      onClose();
    } catch {
      alert('Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Set Reminder</h2>
          <button onClick={onClose} className="text-xl">×</button>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {submission.title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white rounded py-2"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
