"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubmissionCard from "@/components/SubmissionCard";
import SubmissionForm from "@/components/SubmissionForm";
import ReminderForm from '@/components/ReminderForm';
import { getStartOfDay, getEndOfDay } from "@/lib/utils";

export default function HistoryPage() {
  // Default to today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reminderSubmission, setReminderSubmission] = useState(null);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

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
      // Create date range for the selected date
      // We need to parse the YYYY-MM-DD string cleanly in local time
      const date = new Date(selectedDate);
      
      // getStartOfDay/getEndOfDay in lib/utils probably default to 'now'.
      // usage: const start = new Date(selectedDate); start.setHours(0,0,0,0);
      
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      const subResponse = await fetch(
        `/api/submissions?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );
      const subData = await subResponse.json();
      setSubmissions(subData.submissions || []);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
        fetchData();
    }
  }, [selectedDate]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-gray-900">Submission History</h1>
         
         <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-500">Select Date:</span>
            <input 
                type="date" 
                value={selectedDate}
                onChange={handleDateChange}
                className="outline-none text-gray-900 font-bold bg-transparent"
                max={new Date().toISOString().split('T')[0]}
            />
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
         {/* List View */}
         {loading ? (
             <div className="p-12 text-center text-gray-400">Loading...</div>
         ) : submissions.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                <p className="mb-2">No submissions found for {selectedDate}.</p>
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
                 {submissions.map((sub) => (
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
