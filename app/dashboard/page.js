"use client";

import { useEffect, useState } from "react";
import { 
  Trophy, 
  Target, 
  Zap, 
  Activity, 
  RefreshCw,
  Info
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const fetchUserStats = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.exists && data.stats) {
         setUserStats(data.stats);
      }
    } catch (error) {
       console.error("Failed to fetch user stats", error);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Sync successful!");
        fetchUserStats(); // Refresh stats
      } else {
        alert(data.error || "Sync failed");
      }
    } catch (e) {
      alert("An error occurred during sync");
    } finally {
      setSyncing(false);
    }
  };

  const COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

  if (loading && !userStats) {
     return <div className="max-w-6xl mx-auto p-12 text-center text-gray-400">Loading your profile...</div>;
  }

  const pieData = userStats ? [
    { name: 'Easy', value: userStats.easySolved },
    { name: 'Medium', value: userStats.mediumSolved },
    { name: 'Hard', value: userStats.hardSolved },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
             <p className="text-gray-500 mt-1">Your entire LeetCode journey at a glance.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/dashboard/today" className="px-5 py-2.5 bg-[#E88C6D] text-white font-bold rounded-xl shadow-lg hover:bg-[#D07050] transition-all flex items-center gap-2">
                 View Today's Plan <Target size={18} />
             </Link>
          </div>
       </div>

       {/* Main Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Solved - Big Card */}
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Trophy size={120} className="text-yellow-500" />
              </div>
              <div>
                 <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Solved</p>
                 <h2 className="text-5xl font-extrabold text-gray-900 mt-2">{userStats?.solvedProblem || 0}</h2>
              </div>
              <div className="mt-4">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                     <Activity size={12} /> Lifetime Submissions
                  </p>
              </div>
          </div>

          {/* Difficulty Cards */}
          <StatCard 
             label="Easy" 
             value={userStats?.easySolved || 0} 
             total={userStats?.totalSubmissionNum?.find(i => i.difficulty === 'Easy')?.count || 1}
             color="green" 
          />
          <StatCard 
             label="Medium" 
             value={userStats?.mediumSolved || 0} 
             total={userStats?.totalSubmissionNum?.find(i => i.difficulty === 'Medium')?.count || 1}
             color="yellow" 
          />
          <StatCard 
             label="Hard" 
             value={userStats?.hardSolved || 0} 
             total={userStats?.totalSubmissionNum?.find(i => i.difficulty === 'Hard')?.count || 1}
             color="red" 
          />
       </div>

       {/* Middle Section: Distribution & Sync */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Distribution Chart */}
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
             <h3 className="font-bold text-gray-900 mb-4 self-start w-full border-b border-gray-50 pb-2">Distribution</h3>
             <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                         data={pieData}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                      >
                         {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                         ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                   </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
                     <span className="text-2xl font-bold text-gray-900">{userStats?.solvedProblem || 0}</span>
                </div>
             </div>
          </div>

          {/* Sync Center & Info */}
          <div className="md:col-span-2 space-y-6">
             
             {/* Sync Card */}
             <div className="bg-gradient-to-br from-[#E88C6D] to-[#D07050] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div>
                      <h3 className="text-2xl font-bold mb-2">Sync Your Progress</h3>
                      <p className="text-orange-50 max-w-md">
                         Fetch your latest submissions and update your stats. 
                         Click the button to keep everything up to date.
                      </p>
                      
                      <div className="mt-6 flex items-center gap-2 text-xs bg-white/20 p-2 rounded-lg inline-block backdrop-blur-sm border border-white/20">
                         <Info size={14} className="text-white" />
                         <span className="text-white font-medium">Tip: Sync once every 6-12 hours to avoid server load.</span>
                      </div>
                   </div>

                   <button 
                     onClick={handleSync}
                     disabled={syncing}
                     className={`px-8 py-4 bg-white text-[#D07050] font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 ${syncing ? 'opacity-80 cursor-wait' : ''}`}
                   >
                      <RefreshCw size={24} className={syncing ? "animate-spin" : ""} />
                      {syncing ? "Syncing..." : "Sync Now"}
                   </button>
                </div>
             </div>

             {/* Journey Info Block */}
             <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                   <Target className="text-gray-400" size={20} />
                   AlgoSync Journey
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                   Welcome to your personal tracking hub. Please note that due to API limitations, 
                   <strong> we only track the last 20 Accepted submissions</strong> per sync. 
                   Think of this app as tracking your journey <em>from the day you joined us</em>.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                   <p className="text-gray-900 font-bold italic text-sm">
                      "It's not just one day, it's day one."
                   </p>
                   <p className="text-xs text-gray-500 mt-1">
                      Consistent syncing will ensure your history builds up accurately over time.
                   </p>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
}

function StatCard({ label, value, total, color }) {
   const colors = {
      green: "bg-green-50 text-green-700 border-green-100",
      yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
      red: "bg-red-50 text-red-700 border-red-100"
   };
   
   const percent = Math.round((value / total) * 100) || 0;

   return (
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${colors[color]}`}>
          <div className="flex justify-between items-start">
             <span className="font-bold uppercase text-[10px] tracking-widest opacity-70">{label}</span>
             <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-lg backdrop-blur-sm">{percent}%</span>
          </div>
          <div className="mt-4">
             <h3 className="text-4xl font-extrabold">{value}</h3>
             <p className="text-xs opacity-70 mt-1">/ {total} Available</p>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
             <div className="h-full bg-current opacity-50" style={{ width: `${percent}%` }}></div>
          </div>
      </div>
   )
}
