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
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, RefreshCw, Clock, Sigma, AlertCircle } from "lucide-react";
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


  // --- Difficulty & Tag Stats Calculation ---
  const calculateDifficulty = (submissions) => {
    const stats = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
    let missingMetadata = 0;
    submissions.forEach(s => {
       if (s.difficulty) stats[s.difficulty]++;
       else {
          stats.Unknown++;
          missingMetadata++;
       }
    });
    return { data: Object.entries(stats).map(([name, value]) => ({ name, value })), missingMetadata };
  };

  const calculateTags = (submissions) => {
     const tagCounts = {};
     submissions.forEach(s => {
        if (s.topicTags) {
           s.topicTags.forEach(tag => {
              tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
           });
        }
     });
     // Sort and take top 5
     return Object.entries(tagCounts)
       .map(([name, count]) => ({ name, count }))
       .sort((a, b) => b.count - a.count)
       .slice(0, 5);
  };

  const difficultyStats = calculateDifficulty(data.currentWeek);
  const tagStats = calculateTags(data.currentWeek);
  const COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444', Unknown: '#E5E7EB' };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Progress</h1>
          <p className="text-gray-500 mt-1">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
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
           <button onClick={handleNextWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

       {/* Missing Metadata Warning */}
       {difficultyStats.missingMetadata > 0 && (
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                   <AlertCircle size={20} />
                </div>
                <div>
                   <p className="font-bold text-orange-900">Missing Data Detected</p>
                   <p className="text-sm text-orange-700">{difficultyStats.missingMetadata} problems in this week don't have difficulty/tag info.</p>
                </div>
             </div>
             <Link href="/dashboard/history" className="px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg shadow-sm hover:bg-orange-50 transition-colors">
                Go to History & Refresh 🔄
             </Link>
          </div>
       )}

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Col: Difficulty & Tags */}
         <div className="lg:col-span-1 space-y-6">
            {/* Difficulty Chart */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[320px]">
               <h3 className="font-bold text-gray-900 mb-4">Difficulty Distribution</h3>
               <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={difficultyStats.data}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {difficultyStats.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center Total Text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center">
                     <span className="text-3xl font-bold text-gray-900">{currentStats.total}</span>
                     <p className="text-xs text-gray-400 font-bold uppercase">Solved</p>
                  </div>
               </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Top Topics</h3>
               <div className="space-y-4">
                  {tagStats.length === 0 ? (
                     <p className="text-sm text-gray-400 italic">No tag data available.</p>
                  ) : (
                     tagStats.map((tag, idx) => (
                        <div key={idx} className="space-y-1">
                           <div className="flex justify-between text-xs font-bold text-gray-600">
                              <span>{tag.name}</span>
                              <span>{tag.count}</span>
                           </div>
                           <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-blue-500 rounded-full" 
                                 style={{ width: `${(tag.count / currentStats.total) * 100}%` }}
                              ></div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>

         {/* Right Col: Main Graphs & Stats */}
         <div className="lg:col-span-2 space-y-6">
            {/* Stat Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatCard 
                  title="New" 
                  value={currentStats.newSolved} 
                  change={getPercentChange(currentStats.newSolved, prevStats.newSolved)}
                  color="orange"
                  icon={<CheckCircle2 size={18} />} 
               />
               <StatCard 
                  title="Revised" 
                  value={currentStats.revised} 
                  change={getPercentChange(currentStats.revised, prevStats.revised)}
                  color="blue"
                  icon={<RefreshCw size={18} />} 
               />
               <StatCard 
                  title="Old" 
                  value={currentStats.old} 
                  change={getPercentChange(currentStats.old, prevStats.old)}
                  color="gray"
                  icon={<Clock size={18} />} 
               />
               <StatCard 
                  title="Total" 
                  value={currentStats.total} 
                  change={getPercentChange(currentStats.total, prevStats.total)}
                  color="purple"
                  icon={<Sigma size={18} />} 
               />
            </div>

            {/* Daily Distribution Chart */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Daily Activity</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                      <Tooltip 
                        cursor={{fill: '#F9FAFB'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="New" stackId="a" fill="#E88C6D" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Old" stackId="a" fill="#F4E4DE" />
                      <Bar dataKey="Revised" stackId="a" fill="#FFB74D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Upcoming Reminders (Compact) */}
            <div className="bg-[#FFF9F5] rounded-3xl p-6 border border-[#FFE0B2]/30">
               <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-[#E88C6D]" /> Reminders This Week
               </h3>
               {sortedReminders.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No reminders scheduled.</p>
               ) : (
                  <div className="space-y-3">
                     {sortedReminders.slice(0, 3).map(rem => (
                        <Link 
                           key={rem._id} 
                           href={`https://leetcode.com/problems/${rem.titleSlug}`}
                           target="_blank"
                           className="flex w-full bg-white p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all items-center justify-between"
                        >
                           <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-bold text-gray-900 truncate">{rem.title}</p>
                              <p className="text-xs text-[#E88C6D]">{format(new Date(rem.reminderDate), 'MMM d, yyyy')}</p>
                           </div>
                           <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rem.reminderCompleted ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                        </Link>
                     ))}
                     {sortedReminders.length > 3 && (
                        <Link href="/dashboard/reminders" className="text-xs text-center block text-[#E88C6D] font-bold hover:underline">
                           + {sortedReminders.length - 3} more
                        </Link>
                     )}
                  </div>
               )}
            </div>
         </div>
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
