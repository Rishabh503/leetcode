"use client";

import { useEffect, useState } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  isPast,
  isFuture,
  addDays
} from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from 'next/link';
import ReminderForm from '@/components/ReminderForm';

export default function RemindersPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [selectedReminder, setSelectedReminder] = useState(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const fetchReminders = async () => {
    setLoading(true);
    try {
      // Fetch ALL reminders for this week range
      // We leverage the existing API mode='reminders'
      const res = await fetch(
        `/api/submissions?mode=reminders&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );
      const data = await res.json();
      setReminders(data.submissions || []);
    } catch (error) {
      console.error("Failed to fetch reminders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [currentDate]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const handleToggleComplete = async (reminder) => {
    try {
      const newStatus = !reminder.reminderCompleted;
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reminder._id,
          reminderCompleted: newStatus
        })
      });
      
      if (res.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error("Failed to update reminder status", error);
    }
  };

  // --- Filtering Logic ---
  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.reminderCompleted;
    if (filter === 'completed') return r.reminderCompleted;
    return true;
  });

  // Group by day for the list view
  const groupedReminders = {};
  filteredReminders.forEach(r => {
    const dateKey = format(new Date(r.reminderDate), 'yyyy-MM-dd');
    if (!groupedReminders[dateKey]) groupedReminders[dateKey] = [];
    groupedReminders[dateKey].push(r);
  });
  
  // Sort dates
  const sortedDates = Object.keys(groupedReminders).sort();

  // Stats
  const total = reminders.length;
  const completed = reminders.filter(r => r.reminderCompleted).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders & Revisions</h1>
          <p className="text-gray-500 mt-1">Plan and track your spaced repetition</p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
           <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
             <ChevronLeft size={20} />
           </button>
           <div className="px-4 font-medium text-gray-700 flex items-center gap-2">
             <CalendarIcon size={16} />
             {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
           </div>
           <button onClick={handleNextWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Clock size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending This Week</p>
                <p className="text-3xl font-bold text-gray-900">{pending}</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-green-50 rounded-full text-green-600">
                <CheckCircle2 size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completed}</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className={`p-3 rounded-full ${completionRate >= 80 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                <AlertCircle size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
             </div>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
         {['all', 'pending', 'completed'].map(f => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  filter === f 
                  ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
               }`}
            >
               {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
         ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-8">
         {loading ? (
             <div className="text-center py-12 text-gray-400">Loading scheduled revisions...</div>
         ) : sortedDates.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                   <Clock size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No reminders found</h3>
                <p className="text-gray-500 mt-1">You have no scheduled revisions for this week.</p>
             </div>
         ) : (
             sortedDates.map(date => {
                const dateObj = new Date(date);
                const isToday = isSameDay(dateObj, new Date());
                const dayReminders = groupedReminders[date];

                return (
                   <div key={date}>
                      <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                         <CalendarIcon size={16} />
                         {isToday ? 'Today, ' : ''}{format(dateObj, 'EEEE, MMMM do')}
                      </h3>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         {dayReminders.map(rem => {
                            const isPastDue = isPast(new Date(rem.reminderDate)) && !isSameDay(new Date(rem.reminderDate), new Date());
                            const isMissed = isPastDue && !rem.reminderCompleted;
                            
                            // Check if solved late: completedAt exists and is after reminderDate (by more than a day to be generous)
                            const isLateSolved = rem.reminderCompleted && rem.completedAt && new Date(rem.completedAt) > addDays(new Date(rem.reminderDate), 1);

                            return (
                            <div 
                               key={rem._id} 
                               className={`bg-white p-5 rounded-2xl border transition-all group relative overflow-hidden ${
                                  rem.reminderCompleted 
                                     ? 'border-green-100 hover:border-green-300 opacity-90' 
                                     : isMissed // Missed/Overdue
                                        ? 'border-red-200 bg-red-50/20 shadow-sm'
                                        : 'border-gray-100 hover:border-orange-200 hover:shadow-md'
                               }`}
                            >
                               {/* Status Indicator Stripe */}
                               <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  rem.reminderCompleted 
                                     ? (isLateSolved ? 'bg-yellow-500' : 'bg-green-500') 
                                     : (isMissed ? 'bg-red-500' : 'bg-orange-500')
                               }`}></div>

                               <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1 pr-2">
                                     <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {rem.title}
                                     </h4>
                                     <p className="text-xs text-gray-400 mt-1">{rem.titleSlug}</p>
                                     {rem.topicTags && rem.topicTags.length > 0 && (
                                       <div className="flex gap-1 mt-1 flex-wrap">
                                          {rem.topicTags.slice(0, 2).map(tag => (
                                             <span key={tag.slug} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px]">
                                                {tag.name}
                                             </span>
                                          ))}
                                          {rem.topicTags.length > 2 && (
                                            <span className="text-[9px] text-gray-400">+{rem.topicTags.length - 2}</span>
                                          )}
                                       </div>
                                     )}
                                  </div>
                                  
                                  {/* Status Badges */}
                                  {isMissed && (
                                     <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                        Missed
                                     </div>
                                  )}
                                  
                                  {rem.reminderCompleted && (
                                     <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                                        isLateSolved ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                     }`}>
                                        {isLateSolved ? 'Late' : 'Done'} <CheckCircle2 size={12} />
                                     </div>
                                  )}

                                  {!isMissed && !rem.reminderCompleted && (
                                     <div className="bg-orange-100 text-orange-700 p-1.5 rounded-full">
                                        <Clock size={16} />
                                     </div>
                                  )}
                               </div>

                               <div className="flex items-center justify-between mt-4">
                                  <button
                                     onClick={() => setSelectedReminder(rem)}
                                     className="text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider"
                                  >
                                     Edit Date
                                  </button>
                                  
                                  {!rem.reminderCompleted && (
                                     <div className="flex items-center gap-2">
                                       <button
                                         onClick={() => handleToggleComplete(rem)}
                                         className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-green-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-green-200 transition-colors bg-white"
                                       >
                                          <CheckCircle2 size={12} /> Mark Done
                                       </button>
                                       <Link 
                                         href={`https://leetcode.com/problems/${rem.titleSlug}`}
                                         target="_blank"
                                         className={`flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors ${
                                            isMissed 
                                              ? 'bg-red-500 hover:bg-red-600' 
                                              : 'bg-gray-900 hover:bg-orange-600'
                                         }`}
                                       >
                                          Solve <ArrowRight size={12} />
                                       </Link>
                                     </div>
                                  )}
                                  {rem.reminderCompleted && (
                                     <button
                                       onClick={() => handleToggleComplete(rem)}
                                       className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                     >
                                       Undo
                                     </button>
                                  )}
                               </div>
                            </div>
                         );
                         })}
                      </div>
                   </div>
                );
             })
         )}
      </div>

       {/* Edit Modal */}
       {selectedReminder && (
        <ReminderForm
          submission={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onSave={fetchReminders}
        />
      )}
    </div>
  );
}
