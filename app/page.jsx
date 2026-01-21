// app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            LeetCode Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track, analyze, and improve your coding journey
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2">Smart Tracking</h3>
              <p className="text-gray-600 text-sm">
                Automatically fetch and organize your LeetCode submissions
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-lg mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Daily, weekly, and monthly insights into your progress
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="font-bold text-lg mb-2">Reminders</h3>
              <p className="text-gray-600 text-sm">
                Set revision reminders to reinforce your learning
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-lg mb-2">Notes & Metadata</h3>
              <p className="text-gray-600 text-sm">
                Add notes and categorize your problem-solving approaches
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/sync"
              className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Sync Now
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-4 text-center">Quick Start</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </span>
              <span>Click "Sync Now" to fetch your latest accepted submissions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </span>
              <span>Add metadata (solve type, notes, reminders) to each submission</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </span>
              <span>View your progress on daily, weekly, and monthly dashboards</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}