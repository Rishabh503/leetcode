// components/SubmissionCard.js
"use client";

import { formatDate } from "@/lib/utils";

export default function SubmissionCard({
  submission,
  onRefresh,
  onQuickReminder,
}) {
  console.log(onRefresh, onQuickReminder, submission);
  const getSolveTypeBadge = (type) => {
    const styles = {
      new: "bg-green-100 text-green-800",
      revision: "bg-blue-100 text-blue-800",
      practice: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs ${styles[type] || "bg-gray-100 text-gray-800"}`}
      >
        {type || "Pending"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="text-gray-900">{submission.title}</h3>
          <p className="text-sm text-gray-500">{submission.titleSlug}</p>
        </div>
        {getSolveTypeBadge(submission.solveType)}
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
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
        >
          🔄 Refresh
        </button>

        <button
          onClick={() => onQuickReminder(submission)}
          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded"
        >
          ⏰ Reminder
        </button>
      </div>
    </div>
  );
}
