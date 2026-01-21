// app/sync/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSync = async () => {
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
        
        // If new submissions were added, redirect to dashboard after 2 seconds
        if (data.newSubmissions.length > 0) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Sync Submissions</h1>
          <p className="text-gray-600 mb-8">
            Fetch your latest 20 accepted LeetCode submissions
          </p>

          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Syncing...' : 'Sync Now'}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-bold mb-2">✓ Sync Successful</p>
              <p className="text-green-700">{result.message}</p>
              
              {result.newSubmissions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    New submissions:
                  </p>
                  <ul className="space-y-1">
                    {result.newSubmissions.slice(0, 5).map((sub, idx) => (
                      <li key={idx} className="text-sm text-green-700">
                        • {sub.title} ({sub.lang})
                      </li>
                    ))}
                    {result.newSubmissions.length > 5 && (
                      <li className="text-sm text-green-700">
                        ... and {result.newSubmissions.length - 5} more
                      </li>
                    )}
                  </ul>
                  <p className="text-sm text-green-600 mt-3">
                    Redirecting to dashboard...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">How it works:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fetches your latest 20 accepted submissions</li>
              <li>• Detects duplicates automatically</li>
              <li>• Tracks first solves vs revisions</li>
              <li>• You can add metadata after syncing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}