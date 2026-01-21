'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubmissionCard from '@/components/SubmissionCard';
import StatsCard from '@/components/StatsCard';
import ReminderForm from '@/components/ReminderForm';
import { getLast7Days, groupByDate, calculateStats } from '@/lib/utils';

export default function WeeklyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderSubmission, setReminderSubmission] = useState(null);

  const openReminderForm = (submission) => {
    setReminderSubmission(submission);
  };

  const refreshQuestion = async (submission) => {
    try {
      const res = await fetch(
        `https://alfa-leetcode-api.onrender.com/select?titleSlug=${submission.titleSlug}`
      );
      const data = await res.json();

      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submission._id,
          questionNumber: data.questionFrontendId,
          questionLink: `https://leetcode.com/problems/${data.titleSlug}`,
          solveType: submission.solveType || 'new',
        }),
      });

      fetchData();
    } catch {
      alert('Failed to refresh question');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { start, end } = getLast7Days();

      const response = await fetch(
        `/api/submissions?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = calculateStats(submissions);
  const groupedSubmissions = groupByDate(submissions);
  const dates = Object.keys(groupedSubmissions).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              LeetCode Tracker
            </h1>
            <p className="text-sm text-gray-600">Last 7 Days</p>
          </div>
          <Link
            href="/sync"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Sync
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/dashboard" className="px-4 py-2 bg-white rounded">
            Today
          </Link>
          <Link
            href="/dashboard/week"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Week
          </Link>
          <Link href="/dashboard/month" className="px-4 py-2 bg-white rounded">
            Month
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Solved" value={stats.total} icon="📊" />
          <StatsCard title="New" value={stats.new} icon="✨" />
          <StatsCard title="Revisions" value={stats.revision} icon="🔄" />
          <StatsCard title="Practice" value={stats.practice} icon="💪" />
        </div>

        {/* Submissions */}
        {loading ? (
          <p className="text-center">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="text-center">No submissions</p>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date} className="bg-white p-6 rounded border">
                <div className="flex justify-between mb-4">
                  <h2 className="font-bold">{date}</h2>
                  <span className="text-sm text-gray-600">
                    {groupedSubmissions[date].length} problems
                  </span>
                </div>

                <div className="grid gap-4">
                  {groupedSubmissions[date].map((sub) => (
                    <SubmissionCard
                      key={sub._id}
                      submission={sub}
                      onRefresh={refreshQuestion}
                      onQuickReminder={openReminderForm}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reminder Modal */}
      {reminderSubmission && (
        <ReminderForm
          submission={reminderSubmission}
          onClose={() => setReminderSubmission(null)}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
