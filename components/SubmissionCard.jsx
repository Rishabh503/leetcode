// components/SubmissionCard.js
"use client";

import { formatDate } from "@/lib/utils";

// Icon components for compactness
const RefreshIcon = () => (
   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2v6h-6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 22v-6h6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" strokeLinecap="round" strokeLinejoin="round"/>
   </svg>
);

const BellIcon = () => (
   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
   </svg>
);

export default function SubmissionCard({
  submission,
  onRefresh,
  onQuickReminder,
  onTypeChange,
  compact = false
}) {
  const getSolveTypeBadge = (type) => {
    const styles = {
      new: "bg-blue-100 text-blue-700 font-bold uppercase",
      revision: "bg-[#FFF3E0] text-[#E65100] font-bold uppercase",
      practice: "bg-purple-100 text-purple-700 font-bold uppercase",
      old: "bg-gray-100 text-gray-600 font-bold uppercase",
    };

    return (
      <div className={`inline-flex px-3 py-1 rounded text-[10px] tracking-wide ${styles[type] || styles.new}`}>
        {type || "NEW"}
      </div>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    if (!difficulty) return null;
    const styles = {
      easy: "text-green-700 bg-green-50 border-green-200",
      medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
      hard: "text-red-700 bg-red-50 border-red-200"
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[difficulty.toLowerCase()] || "text-gray-500"}`}>
        {difficulty}
      </span>
    );
  };

  // Compact Row View (Dashboard Style)
  if (compact) {
    return (
      <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors group">
         <div className="col-span-6">
            <div className="font-bold text-gray-900">{submission.title}</div>
             <div className="text-xs text-gray-400 mt-1 flex gap-2 flex-wrap items-center">
                {submission.questionNumber && <span>#{submission.questionNumber}</span>}
                <span>{submission.titleSlug}</span>
                
                {/* Topic Tags */}
                {submission.topicTags && submission.topicTags.length > 0 && (
                   <div className="flex gap-1 ml-2">
                      {submission.topicTags.slice(0, 3).map(tag => (
                         <span key={tag.slug} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] whitespace-nowrap">
                            {tag.name}
                         </span>
                      ))}
                      {submission.topicTags.length > 3 && (
                         <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded text-[9px]">
                            +{submission.topicTags.length - 3}
                         </span>
                      )}
                   </div>
                )}
             </div>
         </div>
         <div className="col-span-2">
            {onTypeChange ? (
               <select 
                 value={submission.solveType || "new"}
                 onChange={(e) => onTypeChange(submission, e.target.value)}
                 className="bg-gray-50 border-none text-[10px] font-bold uppercase text-gray-500 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer focus:ring-0"
               >
                 <option value="new">NEW</option>
                 <option value="revision">REVISION</option>
                 <option value="practice">PRACTICE</option>
               </select>
            ) : (
               getSolveTypeBadge(submission.solveType)
            )}
         </div>
         <div className="col-span-2">
             {getDifficultyBadge(submission.difficulty)}
         </div>
         <div className="col-span-2 text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
             <button 
               onClick={() => onRefresh(submission)}
               className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
               title="Refresh Question Data"
             >
               <RefreshIcon />
             </button>
             <button 
               onClick={() => onQuickReminder(submission)}
               className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
               title="Set Reminder"
             >
               <BellIcon />
             </button>
         </div>
      </div>
    );
  }

  // Card View (Original)
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="text-gray-900 flex items-center gap-2">
             {submission.title}
             {getDifficultyBadge(submission.difficulty)}
          </h3>
          <p className="text-sm text-gray-500">{submission.titleSlug}</p>
          {submission.topicTags && submission.topicTags.length > 0 && (
             <div className="flex gap-1 mt-1 flex-wrap">
                {submission.topicTags.slice(0, 3).map(tag => (
                   <span key={tag.slug} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[10px]">
                      {tag.name}
                   </span>
                ))}
             </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {getSolveTypeBadge(submission.solveType)}
          {onTypeChange && (
            <select
              value={submission.solveType || "new"}
              onChange={(e) => onTypeChange(submission, e.target.value)}
              className="text-xs border rounded p-1 bg-white"
            >
              <option value="new">New</option>
              <option value="old">Old</option>
              <option value="revision">Revision</option>
              <option value="practice">Practice</option>
            </select>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <span>{submission.lang}</span> ·{" "}
        <span>{formatDate(submission.timestamp)}</span>
      </div>

      {submission.reminderDate && (
        <div className="text-sm text-orange-600 mb-2">
          Reminder: {formatDate(submission.reminderDate)}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onRefresh(submission)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          🔄 Refresh
        </button>

        <button
          onClick={() => onQuickReminder(submission)}
          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
        >
          ⏰ Reminder
        </button>
      </div>
    </div>
  );
}
