// app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubmissionCard from "@/components/SubmissionCard";
import SubmissionForm from "@/components/SubmissionForm";
import ReminderSection from "@/components/ReminderSection";
import StatsCard from "@/components/StatsCard";
import { getStartOfDay, getEndOfDay, calculateStats } from "@/lib/utils";
import ReminderForm from '@/components/ReminderForm';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
const [reminderSubmission, setReminderSubmission] = useState(null);
const openReminderForm = (submission) => {
  setReminderSubmission(submission);
};

  
  const refreshQuestion = async (submission) => {
    try {
      const res = await fetch(
        `https://alfa-leetcode-api.onrender.com/select?titleSlug=${submission.titleSlug}`,
      );
      const data = await res.json();

      await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission._id,
          questionNumber: data.questionFrontendId,
          questionLink: `https://leetcode.com/problems/${data.titleSlug}`,
          solveType: submission.solveType || "new",
        }),
      });

      fetchData();
    } catch (e) {
      alert("Failed to refresh question");
    }
  };

  // const quickReminder = async (submission) => {
  //   const reminderDate = new Date();
  //   reminderDate.setDate(reminderDate.getDate() + 7); // +7 days

  //   try {
  //     await fetch("/api/submissions", {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         id: submission._id,
  //         reminderDate: reminderDate.toISOString(),
  //         solveType: submission.solveType || "revision",
  //       }),
  //     });

  //     fetchData();
  //   } catch (e) {
  //     alert("Failed to set reminder");
  //   }
  // };

  const fetchData = async () => {
    setLoading(true);
    try {
      const start = getStartOfDay();
      const end = getEndOfDay();

      // Fetch today's submissions
      const subResponse = await fetch(
        `/api/submissions?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );
      const subData = await subResponse.json();

      // Fetch reminders
      const remResponse = await fetch("/api/reminders");
      const remData = await remResponse.json();

      setSubmissions(subData.submissions || []);
      setReminders(remData.reminders || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = calculateStats(submissions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LeetCode Tracker
              </h1>
              <p className="text-sm text-gray-600">Today's Progress</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sync"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Sync
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Today
          </Link>
          <Link
            href="/dashboard/week"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100"
          >
            Week
          </Link>
          <Link
            href="/dashboard/month"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100"
          >
            Month
          </Link>
        </div>

        {/* Reminders */}
        <ReminderSection reminders={reminders} onUpdate={fetchData} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Solved"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <StatsCard
            title="New Problems"
            value={stats.new}
            icon="✨"
            color="green"
          />
          <StatsCard
            title="Revisions"
            value={stats.revision}
            icon="🔄"
            color="purple"
          />
          <StatsCard
            title="Languages"
            value={stats.languages.length}
            subtitle={stats.languages.join(", ")}
            icon="💻"
            color="orange"
          />
        </div>

        {/* Submissions */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No submissions today yet</p>
            <Link
              href="/sync"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Sync Submissions
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Today's Submissions ({submissions.length})
            </h2>
            <div className="grid gap-4">
              {submissions.map((sub) => (
              <SubmissionCard
  submission={sub}
  onRefresh={refreshQuestion}
  onQuickReminder={openReminderForm}
/>

              ))}
            </div>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {selectedSubmission && (
        <SubmissionForm
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSave={fetchData}
        />
      )}
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
