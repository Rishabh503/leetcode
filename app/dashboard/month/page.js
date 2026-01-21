'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubmissionCard from '@/components/SubmissionCard';
import StatsCard from '@/components/StatsCard';
import ReminderForm from '@/components/ReminderForm';
import { getCurrentMonth, groupByDate, calculateStats } from '@/lib/utils';

export default function MonthlyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState(new Set());
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
      const { start, end } = getCurrentMonth();

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

  const toggleDate = (date) => {
    const copy = new Set(expandedDates);
    copy.has(date) ? copy.delete(date) : copy.add(date);
    setExpandedDates(copy);
  };

  const stats = calculateStats(submissions);
  const groupedSubmissions = groupByDate(submissions);
  const dates = Object.keys(groupedSubmissions).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const uniqueQuestions = new Set(submissions.map(s => s.titleSlug)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">LeetCode Tracker</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
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
          <Link href="/dashboard/week" className="px-4 py-2 bg-white rounded">
            Week
          </Link>
          <Link
            href="/dashboard/month"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Month
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatsCard title="Total Submissions" value={stats.total} icon="📊" />
          <StatsCard title="Unique Problems" value={uniqueQuestions} icon="🎯" />
          <StatsCard title="New" value={stats.new} icon="✨" />
          <StatsCard title="Revisions" value={stats.revision} icon="🔄" />
          <StatsCard title="Active Days" value={dates.length} icon="📅" />
        </div>

        {/* Daily Activity */}
        {loading ? (
          <p className="text-center">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="text-center">No submissions this month</p>
        ) : (
          <div className="space-y-3">
            {dates.map((date) => {
              const dateSubs = groupedSubmissions[date];
              const dateStats = calculateStats(dateSubs);
              const isOpen = expandedDates.has(date);

              return (
                <div key={date} className="bg-white border rounded">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full px-6 py-4 flex justify-between hover:bg-gray-50"
                  >
                    <div className="flex gap-4">
                      <span className="font-bold">{date}</span>
                      <span className="text-green-600">
                        {dateStats.new} new
                      </span>
                      <span className="text-blue-600">
                        {dateStats.revision} revision
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t">
                      <div className="grid gap-3 mt-3">
                        {dateSubs.map((sub) => (
                          <SubmissionCard
                            key={sub._id}
                            submission={sub}
                            onRefresh={refreshQuestion}
                            onQuickReminder={openReminderForm}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
