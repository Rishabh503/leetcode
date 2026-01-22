'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

// Icons
const CloudSyncIcon = () => (
  <svg className="w-16 h-16 text-[#E88C6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 16.2A4.5 4.5 0 0 0 21.45 8 2.5 2.5 0 0 0 17 5.5a8 8 0 0 0-14 3.6A3.6 3.6 0 0 0 6 16.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11v9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
    <div className="w-2 h-2 rounded-full bg-green-500"></div>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 text-gray-400 hover:text-[#E88C6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [lcUsername, setLcUsername] = useState('Loading...');
  const [isMissingUsername, setIsMissingUsername] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  const fetchUserDetails = async () => {
     try {
       const res = await fetch('/api/user');
       const data = await res.json();
       if (data.exists && data.leetcodeUsername) {
         setLcUsername(data.leetcodeUsername);
         setIsMissingUsername(false);
       } else {
         setLcUsername('');
         setIsMissingUsername(true);
       }
     } catch (e) {
       console.error(e);
     }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleSaveUsername = async () => {
    if (!inputUsername.trim()) return;
    setSavingUsername(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leetcodeUsername: inputUsername.trim() })
      });
      if (res.ok) {
        setLcUsername(inputUsername.trim());
        setIsMissingUsername(false);
      } else {
        setError('Failed to save username. Try again.');
      }
    } catch (e) {
      setError('Connection error.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSync = async () => {
    if (isMissingUsername) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to sync');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <Navbar />

      {/* Main Content */}
      <div className="pt-20">
        
        {/* Sync Dashboard Header */}
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sync Dashboard</h1>
                <div className="flex items-center gap-3">
                     <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{user?.fullName || 'Developer'}</div>
                        <div className="text-xs text-gray-500">{isMissingUsername ? 'Account not connected' : `Connected as ${lcUsername}`}</div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-[#E88C6D] text-white flex items-center justify-center font-bold overflow-hidden shadow-sm border-2 border-white">
                        {user?.imageUrl ? <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" /> : user?.firstName?.charAt(0)}
                     </div>
                </div>
            </div>

            {/* Sync Card Contextual View */}
            <div className="bg-[#FFF8E7] rounded-3xl p-12 text-center border border-[#FFE0B2]/50 shadow-sm mb-12 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>

                {isMissingUsername ? (
                    <div className="relative z-10 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-50">
                            <svg className="w-10 h-10 text-[#E88C6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect LeetCode</h2>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            To sync your progress, we first need your LeetCode username. We'll use this to fetch your public submission history.
                        </p>
                        
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter LeetCode username"
                                    value={inputUsername}
                                    onChange={(e) => setInputUsername(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl border border-orange-100 bg-white/80 focus:ring-2 focus:ring-[#E88C6D] focus:border-transparent outline-none transition-all font-medium text-gray-700"
                                />
                            </div>
                            <button 
                                onClick={handleSaveUsername}
                                disabled={savingUsername || !inputUsername.trim()}
                                className="bg-[#E88C6D] hover:bg-[#D07050] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200/50 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {savingUsername ? 'Validating...' : 'Connect Account'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-50">
                            <CloudSyncIcon />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Update Your Submissions</h2>
                        <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
                            Excellent! You're connected as <span className="font-bold text-[#D07050]">{lcUsername}</span>. Click below to fetch your latest solved problems.
                        </p>
                        <button 
                            onClick={handleSync}
                            disabled={loading}
                            className="bg-[#E88C6D] hover:bg-[#D07050] text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-orange-200/50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                        >
                            {loading ? (
                                <>
                                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   Syncing Submissions...
                                </>
                            ) : (
                                <>
                                   <span>Sync Progress Now</span>
                                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {(result || error) && (
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                           <h3 className="text-xl font-bold text-gray-900">New Submissions</h3>
                           <p className="text-sm text-gray-500">Fetched during last sync cycle</p>
                        </div>
                        <div className="flex gap-2">
                             {result?.newSubmissions?.length > 0 && (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {result.newSubmissions.length} Success
                                </span>
                             )}
                             {error && (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                    1 Failure
                                </span>
                             )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-5">Problem Name</div>
                            <div className="col-span-2">Solve Type</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Time Fetched</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="p-8 text-center text-red-600 bg-red-50">
                                {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {result && result.newSubmissions.length === 0 && !error && (
                            <div className="p-12 text-center text-gray-500">
                                No new submissions found since last sync.
                            </div>
                        )}

                        {/* List Items */}
                        {result?.newSubmissions?.map((sub, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                                <div className="col-span-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            // Simple heuristic for difficulty color based on nothing but aesthetics for now since we don't have it
                                            idx % 3 === 0 ? 'bg-green-100 text-green-700' :
                                            idx % 3 === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {sub.title.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{sub.title}</div>
                                            <div className="text-xs text-gray-500">{sub.titleSlug}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                        sub.isFirstSolve ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {sub.isFirstSolve ? 'New Problem' : 'Revision'}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <CheckCircleIcon />
                                    <span className="text-sm font-medium text-green-700">Accepted</span>
                                </div>
                                <div className="col-span-2 text-sm text-gray-500">
                                    Just now
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Link href={`/dashboard`} target="_blank">
                                       <ExternalLinkIcon />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}