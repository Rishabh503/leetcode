"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubmissionCard from "@/components/SubmissionCard";
import SubmissionForm from "@/components/SubmissionForm";
import ReminderForm from '@/components/ReminderForm';
import { getStartOfDay, getEndOfDay } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

// Icons
const StatIcon = ({ type }) => {
  const styles = {
    total: "bg-green-100 text-green-600",
    new: "bg-blue-100 text-blue-600",
    revision: "bg-orange-100 text-orange-600"
  };
  
  const icons = {
    total: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    new: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    revision: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles[type]}`}>
      {icons[type]}
    </div>
  );
};

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reminderSubmission, setReminderSubmission] = useState(null);

  const openReminderForm = (submission) => {
    setReminderSubmission(submission);
  };

  const updateSolveType = async (submission, newType) => {
    try {
      await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission._id,
          solveType: newType,
        }),
      });
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
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
      const todaysSubmissions = subData.submissions || [];
      setSubmissions(todaysSubmissions);

      // Fetch PENDING reminders (due today or overdue)
      // Note: We modified the API to accept pendingReminders=true
      const remResponse = await fetch("/api/submissions?pendingReminders=true");
      const remData = await remResponse.json();
      setReminders(remData.submissions || []);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalProblems = submissions.length;
  const newProblems = submissions.filter(s => s.solveType === 'new' || s.isFirstSolve).length;
  const revisionProblems = submissions.filter(s => s.solveType === 'revision' || (!s.isFirstSolve && s.solveType !== 'new')).length;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Today's Progress</h1>

      {/* Reminders Banner */}
      <div className="space-y-4 mb-8">
        {reminders.length > 0 ? (
          reminders.map((rem) => (
             <div key={rem._id} className="bg-[#FFF8E7] border border-[#FFD8CC] rounded-xl p-4 flex justify-between items-center group hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                   <div className="text-[#E65100]">⚠️</div>
                   <p className="text-[#BF360C] text-sm font-medium">
                      Reminder: <span className="font-bold">{rem.title}</span> needs revision today.
                   </p>
                </div>
                <Link href={`https://leetcode.com/problems/${rem.titleSlug}`} target="_blank" className="text-sm font-bold text-[#E88C6D] hover:text-[#D07050]">
                   SOLVE NOW
                </Link>
             </div>
          ))
        ) : (
           <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                   <div className="text-green-600">✅</div>
                   <p className="text-green-800 text-sm font-medium">All caught up! No pending revisions for today.</p>
               </div>
           </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {/* Total Problems Card */}
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <StatIcon type="total" />
            <p className="text-gray-500 text-sm font-medium mt-4 mb-1">Total Problems Solved Today</p>
            <p className="text-4xl font-bold text-gray-900">{totalProblems}</p>
         </div>

         {/* New Problems Card */}
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <StatIcon type="new" />
            <p className="text-gray-500 text-sm font-medium mt-4 mb-1">New Problems</p>
            <p className="text-4xl font-bold text-gray-900">{newProblems}</p>
         </div>

         {/* Revisions Card */}
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <StatIcon type="revision" />
            <p className="text-gray-500 text-sm font-medium mt-4 mb-1">Revisions Done</p>
            <p className="text-4xl font-bold text-gray-900">{revisionProblems}</p>
         </div>
      </div>

      {/* Today's Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
         <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Today's Queue</h3>
         </div>
         
         {loading ? (
             <div className="p-12 text-center text-gray-400">Loading...</div>
         ) : submissions.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                No submissions yet. Time to grind! 
                <br/>
                <Link href="/sync" className="text-[#E88C6D] hover:underline font-bold mt-2 inline-block">Sync Now</Link>
             </div>
         ) : (
             <div>
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-3 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                   <div className="col-span-6">Problem</div>
                   <div className="col-span-2">Solve Type</div>
                   <div className="col-span-2">Difficulty</div>
                   <div className="col-span-2 text-right">Actions</div>
                </div>

                 {/* List */}
                 {submissions.map((sub, idx) => (
                    <SubmissionCard 
                       key={sub._id} 
                       submission={sub}
                       onRefresh={refreshQuestion}
                       onQuickReminder={openReminderForm}
                       onTypeChange={updateSolveType}
                       compact={true}
                    />
                 ))}
             </div>
         )}
         
         <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <Link href="/dashboard/history" className="text-sm font-medium text-gray-500 hover:text-gray-900">
               View All Problems
            </Link>
         </div>
      </div>

      {/* Modals */}
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
