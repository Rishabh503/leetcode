'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      checkUser();
    }
  }, [isLoaded, user]);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      
      if (data.exists && data.leetcodeUsername) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Check user error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leetcodeUsername: username }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to save username');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AlgoSync! 👋</h1>
          <p className="text-gray-600">
            Let's link your LeetCode account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LeetCode Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E88C6D] focus:border-transparent outline-none transition-all"
              placeholder="e.g. Rishabh2906"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#E88C6D] hover:bg-[#D07050] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Syncing...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
