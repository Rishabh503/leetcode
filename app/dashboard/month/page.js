"use client";

import { useEffect, useState } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Clock, 
  TrendingUp, 
  CalendarDays, 
  Award, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Target
} from "lucide-react";
import Link from 'next/link';

export default function MonthlyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/submissions?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}&mode=submissions`
      );
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // --- Analytics Logic ---

  // 1. Group by Day for Line Chart
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyData = daysInMonth.map(day => {
    const dailySubs = submissions.filter(s => isSameDay(new Date(s.timestamp), day));
    return {
      date: day,
      label: format(day, 'd'),
      count: dailySubs.length,
    };
  });

  // 2. Best & Worst Days logic
  const activeDays = dailyData.filter(d => d.count > 0);
  const bestDay = activeDays.length > 0 
    ? activeDays.reduce((prev, current) => (prev.count > current.count) ? prev : current) 
    : null;
  const lowDay = activeDays.length > 0
    ? activeDays.reduce((prev, current) => (prev.count < current.count && prev.count > 0) ? prev : current) // strictly lowest non-zero
    : null;

  // 3. Totals & Pie Chart Data
  const totalSolved = submissions.length;
  const newCount = submissions.filter(s => s.solveType === 'new' || s.isFirstSolve).length;
  const revisedCount = submissions.filter(s => s.solveType === 'revision').length;
  const oldCount = submissions.filter(s => s.solveType === 'old' || s.solveType === 'practice').length;

  const pieData = [
    { name: 'New Problems', value: newCount, color: '#E88C6D' },
    { name: 'Revised', value: revisedCount, color: '#FFB74D' },
    { name: 'Old/Practice', value: oldCount, color: '#F4E4DE' },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your performance metrics</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
           <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
              <ChevronLeft size={20} />
           </button>
           <div className="px-2 font-bold text-gray-800 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
           </div>
           {/* Prevent going to future months? Optional. Removing restriction for flexibility */}
           <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Top Summary Big Card */}
      <div className="bg-[#FFF8E7] rounded-3xl p-8 border border-[#FFE0B2] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
         
         <div className="relative z-10">
            <h2 className="text-sm font-bold text-[#E65100] uppercase tracking-wider mb-2">Total Output</h2>
            <div className="text-6xl font-bold text-gray-900 mb-2">{totalSolved}</div>
            <p className="text-[#BF360C] font-medium">Problems solved in {format(currentDate, 'MMMM')}</p>
         </div>

         <div className="grid grid-cols-3 gap-8 relative z-10 w-full md:w-auto">
             <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{activeDays.length}</div>
                <div className="text-xs text-gray-500 font-bold uppercase mt-1">Active Days</div>
             </div>
             <div className="text-center border-l border-orange-200/50">
                <div className="text-2xl font-bold text-gray-900">{Math.round(totalSolved / (activeDays.length || 1))}</div>
                <div className="text-xs text-gray-500 font-bold uppercase mt-1">Avg / Day</div>
             </div>
             <div className="text-center border-l border-orange-200/50">
                <div className="text-2xl font-bold text-gray-900">{revisedCount}</div>
                <div className="text-xs text-gray-500 font-bold uppercase mt-1">Revisions</div>
             </div>
         </div>
      </div>

      {/* Missing Metadata Warning */}
      {(() => {
         let missing = submissions.filter(s => !s.difficulty && !s.topicTags).length;
         if (missing > 0) return (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                     <AlertCircle size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-orange-900">Missing Data Detected</p>
                     <p className="text-sm text-orange-700">{missing} problems in this month don't have difficulty/tag info.</p>
                  </div>
               </div>
               <Link href="/dashboard/history" className="px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg shadow-sm hover:bg-orange-50 transition-colors">
                  Go to History & Refresh 🔄
               </Link>
            </div>
         );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Col: Distributions */}
         <div className="space-y-6 lg:col-span-1">
             
             {/* Difficulty Distribution */}
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2 self-start">Difficulty</h3>
                <div className="h-[220px] w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={[
                            { name: 'Easy', value: submissions.filter(s => s.difficulty === 'Easy').length },
                            { name: 'Medium', value: submissions.filter(s => s.difficulty === 'Medium').length },
                            { name: 'Hard', value: submissions.filter(s => s.difficulty === 'Hard').length }
                         ].filter(d => d.value > 0)}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {[{name: 'Easy', color: '#10B981'}, {name: 'Medium', color: '#F59E0B'}, {name: 'Hard', color: '#EF4444'}]
                             .map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" />
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900">{totalSolved}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Solved</p>
                   </div>
                </div>
             </div>

             {/* Top Tags */}
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Tags</h3>
                <div className="space-y-3">
                   {(() => {
                      const tagCounts = {};
                      submissions.forEach(s => {
                         if (s.topicTags) {
                            s.topicTags.forEach(t => tagCounts[t.name] = (tagCounts[t.name] || 0) + 1);
                         }
                      });
                      const sortedTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
                      
                      if(sortedTags.length === 0) return <p className="text-gray-400 italic text-sm">No tags available</p>;

                      return sortedTags.map(([tag, count]) => (
                         <div key={tag} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                               <span>{tag}</span>
                               <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / totalSolved) * 100}%` }}></div>
                            </div>
                         </div>
                      ));
                   })()}
                </div>
             </div>
         </div>

         {/* Best & Worst Days */}
         <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Best Day Card */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-green-100 shadow-sm relative">
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 p-2 rounded-full">
                   <TrendingUp size={20} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">Best Day</h3>
                <p className="text-xs text-green-600 font-medium mb-8">Highest productivity peak</p>
                
                {bestDay ? (
                   <div>
                       <div className="text-4xl font-bold text-gray-900 mb-2">
                          {bestDay.count} Solves
                       </div>
                       <div className="inline-block bg-white border border-green-200 px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm">
                          {format(bestDay.date, 'EEEE, MMM do')}
                       </div>
                   </div>
                ) : (
                   <div className="text-gray-400 italic mt-8">No data yet</div>
                )}
            </div>

            {/* Worst Day Card */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-3xl border border-red-100 shadow-sm relative">
                <div className="absolute top-4 right-4 bg-red-100 text-red-700 p-2 rounded-full">
                   <AlertCircle size={20} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">Lowest Day</h3>
                <p className="text-xs text-red-600 font-medium mb-8">Room for consistency improvement</p>
                
                {lowDay ? (
                   <div>
                       <div className="text-4xl font-bold text-gray-900 mb-2">
                          {lowDay.count} Solves
                       </div>
                       <div className="inline-block bg-white border border-red-200 px-3 py-1 rounded-full text-xs font-bold text-red-800 shadow-sm">
                          {format(lowDay.date, 'EEEE, MMM do')}
                       </div>
                   </div>
                ) : (
                   <div className="text-gray-400 italic mt-8">No low activity days recorded yet</div>
                )}
            </div>
            
            {/* Activity Chart Area */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Volume History</h3>
                <div className="h-[200px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E88C6D" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#E88C6D" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#9CA3AF', fontSize: 10}} 
                          interval={4} 
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#E88C6D" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
}
