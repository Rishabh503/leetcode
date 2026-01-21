// lib/utils.js

// Convert Unix timestamp to IST Date
export function unixToIST(timestamp) {
  const date = new Date(parseInt(timestamp) * 1000);
  return date;
}

// Format date to readable string
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get start and end of day in IST
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Get date ranges
export function getLast7Days() {
  const end = getEndOfDay();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function getCurrentMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = getEndOfDay();
  return { start, end };
}

// Group submissions by date
export function groupByDate(submissions) {
  const grouped = {};
  
  submissions.forEach(sub => {
    const date = new Date(sub.timestamp).toLocaleDateString('en-IN');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(sub);
  });
  
  return grouped;
}

// Calculate stats
export function calculateStats(submissions) {
  const stats = {
    total: submissions.length,
    new: 0,
    revision: 0,
    practice: 0,
    languages: new Set()
  };
  
  submissions.forEach(sub => {
    if (sub.solveType === 'new') stats.new++;
    else if (sub.solveType === 'revision') stats.revision++;
    else if (sub.solveType === 'practice') stats.practice++;
    stats.languages.add(sub.lang);
  });
  
  return {
    ...stats,
    languages: Array.from(stats.languages)
  };
}