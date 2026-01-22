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

export default function TodayPage() {
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
      
      const difficulty = data.difficulty || data.question?.difficulty || null;
      const topicTags = data.topicTags || data.question?.topicTags || [];

      await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission._id,
          questionNumber: data.questionFrontendId,
          questionLink: `https://leetcode.com/problems/${data.titleSlug}`,
          difficulty: difficulty,
          topicTags: topicTags
        }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to refresh question data");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const start = getStartOfDay(new Date());
      const end = getEndOfDay(new Date());
      
      // Fetch submissions
      const subRes = await fetch(
        `/api/submissions?startDate=${start.toISOString()}&endDate=${end.toISOString()}&mode=submissions`
      );
      const subData = await subRes.json();
      
      // Fetch reminders due today
      const remRes = await fetch(
        `/api/submissions?mode=reminders&targetDate=${end.toISOString()}&pendingReminders=true`
      );
      const remData = await remRes.json();
      
      setSubmissions(subData.submissions || []);
      setReminders(remData.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Progress</h1>
          <p className="text-gray-500">Track your daily grind</p>
        </div>

      </div>


      {/* Stats & Reminders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 1. Daily Snapshot (Combined Stats) */}
         <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            
            <div className="mb-6">
                <div className="text-6xl font-black text-gray-900 tracking-tight">{submissions.length}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Solved Today</div>
            </div>
            
            <div className="w-full h-px bg-gray-100 mb-6"></div>

            <div className="flex justify-center gap-8 w-full">
               <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-blue-600">
                      {submissions.filter(s => s.solveType === 'new' || s.isFirstSolve).length}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">New</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-orange-600">
                      {submissions.filter(s => s.solveType === 'revision').length}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">Revision</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-purple-600">
                      {submissions.filter(s => s.solveType === 'practice' || s.solveType === 'old').length}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">Practice</div>
               </div>
            </div>
         </div>

         {/* 2. Priority Focus (Reminders) - Spans 2 cols */}
         <div className={`lg:col-span-2 rounded-2xl border shadow-sm p-6 relative overflow-hidden flex flex-col justify-center ${
             reminders.length > 0 
             ? 'bg-gradient-to-br from-[#FFF9E6] to-white border-orange-100' 
             : 'bg-white border-gray-100'
         }`}>
             {reminders.length > 0 ? (
                 <>
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <svg className="w-32 h-32 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                               <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg animate-pulse">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                               </span>
                               Urgent Attention Needed
                           </h3>
                           <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                              {reminders.length} Pending
                           </span>
                        </div>
                        
                        <div className="space-y-3">
                           {reminders.slice(0, 2).map(rem => (
                               <div key={rem._id} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-orange-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-all gap-4">
                                   <div>
                                      <div className="font-bold text-gray-900">{rem.title}</div>
                                      <div className="text-xs text-orange-600 font-medium flex items-center gap-1 mt-1">
                                         <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                                         Due for revision today
                                      </div>
                                   </div>
                                   <a 
                                      href={rem.questionLink || `https://leetcode.com/problems/${rem.titleSlug}`} 
                                      target="_blank"
                                      className="w-full sm:w-auto text-center bg-[#E65100] hover:bg-[#BF360C] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider"
                                   >
                                      Solve Now
                                   </a>
                               </div>
                           ))}
                        </div>
                        
                        {reminders.length > 2 && (
                            <div className="mt-3 text-center">
                               <a href="/dashboard/reminders" className="text-xs font-bold text-gray-400 hover:text-orange-600 transition-colors">
                                  + {reminders.length - 2} more pending tasks
                               </a>
                            </div>
                        )}
                    </div>
                 </>
             ) : (
                 <div className="flex flex-col items-center justify-center text-center h-full py-6">
                     <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                         <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                     </div>
                     <h3 className="font-bold text-gray-900">All Caught Up!</h3>
                     <p className="text-xs text-gray-400 mt-1">No pending revisions for today. Good job!</p>
                 </div>
             )}
         </div>
      </div>

      {/* 3. Today's Queue Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-900">Today's Queue</h2>
         </div>
         
         <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-50 bg-[#FFFCF9] text-[10px] font-bold uppercase tracking-wider text-gray-400">
               <div className="col-span-5">Problem</div>
               <div className="col-span-3 text-center">Solve Type</div>
               <div className="col-span-2">Difficulty</div>
               <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            {loading ? (
                <div className="p-12 text-center text-gray-400">Loading queue...</div>
            ) : submissions.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic">No submissions for today</div>
            ) : (
                submissions.map((sub) => (
                   <div key={sub._id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                      {/* Problem Col */}
                      <div className="col-span-5">
                         <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {sub.questionNumber && <span className="text-gray-400 font-mono text-xs">{sub.questionNumber}.</span>}
                            {sub.title}
                         </div>
                         <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
                            {sub.topicTags && sub.topicTags.slice(0, 3).map(tag => (
                               <span key={tag.slug}>{tag.name}</span>
                            )).reduce((prev, curr) => [prev, ', ', curr])}
                         </div>
                      </div>

                      {/* Solve Type Col */}
                      <div className="col-span-3 flex justify-center">
                         <div className="relative group/select w-24">
                             <select 
                               value={sub.solveType || "new"}
                               onChange={(e) => updateSolveType(sub, e.target.value)}
                               className="appearance-none bg-[#FFF3E0] text-[#E65100] hover:bg-[#FFE0B2] text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg cursor-pointer text-center w-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 border border-transparent hover:border-orange-200"
                             >
                               <option value="new">NEW</option>
                               <option value="revision">REVISION</option>
                               <option value="practice">PRACTICE</option>
                             </select>
                         </div>
                      </div>

                      {/* Difficulty Col */}
                      <div className="col-span-2">
                         <span className={`text-xs font-bold ${
                            !sub.difficulty ? 'text-gray-400' :
                            sub.difficulty === 'Easy' ? 'text-green-600' :
                            sub.difficulty === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                         }`}>
                            {sub.difficulty || "N/A"}
                         </span>
                      </div>

                      {/* Actions Col */}
                      <div className="col-span-2 flex justify-end gap-2">
                         <button 
                           onClick={() => refreshQuestion(sub)}
                           className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                           title="Refresh"
                         >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                         </button>
                         <button 
                           onClick={() => openReminderForm(sub)}
                           className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                           title="Reminder"
                         >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                         </button>
                      </div>
                   </div>
                ))
            )}
         </div>
      </div>

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
