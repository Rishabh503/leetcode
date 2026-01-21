'use client';

import { useEffect, useState } from 'react';

export default function SubmissionForm({ submission, onClose, onSave }) {
  const [formData, setFormData] = useState({
    solveType: submission?.solveType || 'new',
    questionNumber: submission?.questionNumber || '',
    questionLink: submission?.questionLink || '',
    notes: submission?.notes || '',
    reminderDate: submission?.reminderDate
      ? new Date(submission.reminderDate).toISOString().split('T')[0]
      : ''
  });

  const [loading, setLoading] = useState(false);

  // Fetch question details from LeetCode API
  useEffect(() => {
    if (!submission?.titleSlug) return;

    async function getQuestionData() {
      try {
        const res = await fetch(
          `https://alfa-leetcode-api.onrender.com/select?titleSlug=${submission.titleSlug}`
        );

        if (!res.ok) throw new Error('Failed to fetch question data');

        const data = await res.json();

        // Auto-fill fields safely
        setFormData((prev) => ({
          ...prev,
          questionNumber: prev.questionNumber || data.questionFrontendId || '',
          questionLink:
            prev.questionLink ||
            `https://leetcode.com/problems/${data.titleSlug}`
        }));
      } catch (err) {
        console.error('Error fetching question data:', err);
      }
    }

    getQuestionData();
  }, [submission?.titleSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submission._id,
          ...formData
        })
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert('Failed to update submission');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error updating submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Details</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="font-medium text-sm">{submission?.title}</p>
          <p className="text-xs text-gray-500">{submission?.lang}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Solve Type */}
          <div>
            <label className="block text-sm mb-1">Solve Type *</label>
            <select
              value={formData.solveType}
              onChange={(e) => setFormData({ ...formData, solveType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="new">New</option>
              <option value="revision">Revision</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          {/* Question Number */}
          <div>
            <label className="block text-sm mb-1">Question Number</label>
            <input
              type="number"
              value={formData.questionNumber}
              onChange={(e) =>
                setFormData({ ...formData, questionNumber: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Question Link */}
          <div>
            <label className="block text-sm mb-1">Question Link</label>
            <input
              type="url"
              value={formData.questionLink}
              onChange={(e) =>
                setFormData({ ...formData, questionLink: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              placeholder="https://leetcode.com/problems/..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm mb-1">Reminder Date</label>
            <input
              type="date"
              value={formData.reminderDate}
              onChange={(e) =>
                setFormData({ ...formData, reminderDate: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded py-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded py-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
