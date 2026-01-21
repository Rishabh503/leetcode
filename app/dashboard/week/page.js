"use client";

import { useEffect, useState } from "react";
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  addWeeks, 
  format, 
  eachDayOfInterval, 
  isSameDay, 
  addDays 
} from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, RefreshCw, Clock, Sigma } from "lucide-react";
import Link from 'next/link';

export default function WeeklyProgressPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState({
    currentWeek: [],
    prevWeek: [],
    reminders: []
  });
  const [loading, setLoading] = useState(true);

  // Constants
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const prevWeekStart = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Current Week Submissions
      const currentRes = await fetch(
        `/api/submissions?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );
      const currentData = await currentRes.json();

      // 2. Fetch Previous Week Submissions (for comparison)
      const prevRes = await fetch(
        `/api/submissions?startDate=${prevWeekStart.toISOString()}&endDate=${prevWeekEnd.toISOString()}`
      );
      const prevData = await prevRes.json();

      // 3. Fetch Reminders due this week
      const remRes = await fetch(
        `/api/submissions?mode=reminders&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );
      const remData = await remRes.json();

      setData({
        currentWeek: currentData.submissions || [],
        prevWeek: prevData.submissions || [],
        reminders: remData.submissions || []
      });

    } catch (error) {
      console.error("Failed to fetch weekly data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  // --- Calculations ---

  const calculateStats = (submissions) => {
     const newSolved = submissions.filter(s => s.solveType === 'new' || s.isFirstSolve).length;
     const revised = submissions.filter(s => s.solveType === 'revision').length;
     const old = submissions.filter(s => s.solveType === 'old' || s.solveType === 'practice').length;
     const total = submissions.length;
     return { newSolved, revised, old, total };
  };

  const currentStats = calculateStats(data.currentWeek);
  const prevStats = calculateStats(data.prevWeek);

  const getPercentChange = (current, prev) => {
    if (prev === 0) return current > 0 ? "+100%" : "Stable";
    const diff = current - prev;
    const percent = Math.round((diff / prev) * 100);
    return percent > 0 ? `+${percent}%` : `${percent}%`;
  };

  // --- Chart Data Preparation ---
  const chartData = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
    const daySubs = data.currentWeek.filter(s => isSameDay(new Date(s.timestamp), day));
    return {
      name: format(day, 'EEE').toUpperCase(), // MON, TUE...
      New: daySubs.filter(s => s.solveType === 'new' || s.isFirstSolve).length,
      Revised: daySubs.filter(s => s.solveType === 'revision').length,
      Old: daySubs.filter(s => s.solveType === 'old' || s.solveType === 'practice').length,
    };
  });

  // --- Upcoming Reminders (This Week) ---
  // Sort reminders by date
  const sortedReminders = [...data.reminders].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Progress Overview</h1>
          <p className="text-gray-500 mt-1">
            {format(weekStart, 'MMMM d, yyyy')} — {format(weekEnd, 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
           <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
             <ChevronLeft size={20} />
           </button>
           <div className="px-4 font-medium text-gray-700 flex items-center gap-2">
             <CalendarIcon size={16} />
             {isSameDay(currentDate, new Date()) ? 'Current Week' : 'Selected Week'}
           </div>
           {/* Only allow next week if not in future? Optional. For now let freely navigate */}
           <button onClick={handleNextWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard 
            title="NEW SOLVED" 
            value={currentStats.newSolved} 
            change={getPercentChange(currentStats.newSolved, prevStats.newSolved)}
            icon={<CheckCircle2 className="text-[#E88C6D]" />}
            color="orange"
         />
         <StatCard 
            title="OLD SOLVED" 
            value={currentStats.old} 
            change={getPercentChange(currentStats.old, prevStats.old)}
            subLabel="Stable" // Placeholder logic
            icon={<Clock className="text-gray-500" />}
            color="gray"
         />
         <StatCard 
            title="REVISED" 
            value={currentStats.revised} 
            change={getPercentChange(currentStats.revised, prevStats.revised)}
            icon={<RefreshCw className="text-blue-500" />}
            color="blue"
         />
         <StatCard 
            title="TOTAL COUNT" 
            value={currentStats.total} 
            change={getPercentChange(currentStats.total, prevStats.total)}
            icon={<Sigma className="text-purple-500" />}
            color="purple"
         />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Daily Distribution</h3>
            <div className="flex gap-4 text-xs font-bold">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#E88C6D]"></div> New</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F4E4DE]"></div> Old</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FFB74D]"></div> Revised</div>
            </div>
         </div>
         
         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#FFF8E7'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="New" stackId="a" fill="#E88C6D" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Old" stackId="a" fill="#F4E4DE" />
                <Bar dataKey="Revised" stackId="a" fill="#FFB74D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Upcoming Reminders Section */}
      <div className="bg-[#FFF9F5] rounded-3xl p-8 border border-[#FFE0B2]/30">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
           <Clock size={20} className="text-[#E88C6D]" /> Upcoming Reminders This Week
        </h3>

        {sortedReminders.length === 0 ? (
           <p className="text-gray-500 italic">No reminders scheduled for this week.</p>
        ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedReminders.map(rem => (
                 <Link 
                   key={rem._id} 
                   href={`https://leetcode.com/problems/${rem.titleSlug}`}
                   target="_blank"
                   className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-[#E88C6D] bg-[#FFF0EB] px-2 py-1 rounded">
                          {format(new Date(rem.reminderDate), 'EEE, MMM d')}
                       </span>
                       <span className={`w-2 h-2 rounded-full ${rem.reminderCompleted ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                    </div>
                    <div className="font-bold text-gray-900 group-hover:text-[#E88C6D] transition-colors truncate">
                       {rem.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                       {rem.reminderCompleted ? 'Completed' : 'Pending'}
                    </div>
                 </Link>
              ))}
           </div>
        )}
      </div>

    </div>
  );
}

// Components

const StatCard = ({ title, value, change, icon, color, subLabel }) => {
   const isPositive = change && change.includes('+');
   const isStable = change === 'Stable';
   
   return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100shadow-sm hover:shadow-md transition-shadow">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50`}>
               {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
               isStable ? 'bg-gray-100 text-gray-600' :
               isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
               {change}
            </span>
         </div>
         <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">{title}</p>
         <h2 className="text-4xl font-bold text-gray-900">{value < 10 ? `0${value}` : value}</h2>
      </div>
   );
}
