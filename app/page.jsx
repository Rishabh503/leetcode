// app/page.js
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';

// Simple SVG Icons
const LogoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-8 h-8 text-[#E88C6D]"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="none" fill="#F4E4DE" />
    <path d="M7 17V7H17" stroke="#E88C6D" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 17H7" stroke="#E88C6D" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChartIcon = () => (
  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-[#E88C6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ReminderIcon = () => (
  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 2h4m-2 0v20m-8-8h16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const TopicIcon = () => (
  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-[#E88C6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12l8-4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12L4 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 22v-6h6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ... (other icons kept for hero section if needed)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7] font-sans selection:bg-[#E88C6D] selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF0EB] rounded-full mb-8 border border-[#FFD8CC]">
            <div className="w-2 h-2 rounded-full bg-[#E88C6D]"></div>
            <span className="text-[10px] font-bold tracking-wider text-[#D07050] uppercase">
              Personal Analytics Dashboard
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-[#1C1C1C] leading-tight mb-6 tracking-tight">
            Track Your DSA Progress.<br />
            <span className="text-[#E88C6D]">Intelligently.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automatically sync your LeetCode submissions, visualize growth trends, 
            and never forget a pattern with smart revision reminders.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="px-8 py-3.5 bg-[#E88C6D] hover:bg-[#D07050] text-white rounded-full font-semibold shadow-lg shadow-orange-200/50 transition-all flex items-center"
              >
                Go to Dashboard <ArrowRightIcon />
              </Link>
              <Link 
                href="/sync" 
                className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold hover:border-gray-300 hover:shadow-sm transition-all flex items-center"
              >
                Sync Submissions <RefreshIcon />
              </Link>
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                 <button className="px-8 py-3.5 bg-[#E88C6D] hover:bg-[#D07050] text-white rounded-full font-semibold shadow-lg shadow-orange-200/50 transition-all flex items-center">
                   Get Started <ArrowRightIcon />
                 </button>
              </SignInButton>
              <button className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold hover:border-gray-300 hover:shadow-sm transition-all flex items-center">
                 View Demo
              </button>
            </SignedOut>
          </div>

          {/* ... Mockup ... */}

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 md:p-4 rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="bg-[#FAF9F6] rounded-xl border border-gray-100 overflow-hidden min-h-[400px]">
                {/* Mockup Header */}
                <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-2 bg-white">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Mockup Content */}
                <div className="p-6 md:p-8">
                  <div className="flex gap-6 mb-8 overflow-x-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 min-w-[200px] h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden group">
                        <div className="h-2 w-16 bg-gray-100 rounded mb-3"></div>
                        <div className="h-8 w-24 bg-gray-100 rounded mb-4"></div>
                        <div className="absolute bottom-4 left-4 h-2 w-full pr-8">
                           <div className="h-full bg-gray-50 rounded w-3/4"></div>
                        </div>
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="h-4 w-32 bg-gray-100 rounded mb-8"></div>
                      <div className="flex items-end gap-4 h-40">
                         {[40, 60, 45, 70, 50, 80, 65, 85].map((h, i) => (
                           <div key={i} style={{height: `${h}%`}} className="flex-1 bg-[#F4E4DE] rounded-t-sm hover:bg-[#E88C6D] transition-colors"></div>
                         ))}
                      </div>
                    </div>
                    <div className="col-span-1 h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                       <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                       <div className="space-y-3">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded bg-gray-50"></div>
                             <div className="flex-1">
                               <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                               <div className="h-2 w-1/2 bg-gray-50 rounded"></div>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#E88C6D]/10 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-4">
              Focus on Solving, We Handle Tracking
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The minimalist toolkit for serious competitive programmers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ChartIcon />,
                title: 'Progress Tracking',
                desc: 'Visualize your daily solves, language distribution, and difficulty breakdown in high-fidelity charts.'
              },
              {
                icon: <ReminderIcon />,
                title: 'Revision Reminders',
                desc: 'Smart reminders using Spaced Repetition to ensure you master the logic of tricky problems forever.'
              },
              {
                icon: <TopicIcon />,
                title: 'Topic Mastery',
                desc: 'Identify weak areas by tracking performance across different algorithmic tags and patterns.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl border border-gray-100 bg-[#FFFBF7]/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
                {feature.icon}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#E88C6D] rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
             
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to level up your game?
                </h2>
                <p className="text-orange-50 mb-10 max-w-2xl mx-auto text-lg">
                  Join hundreds of developers who have optimized their DSA preparation with our intelligent dashboard.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    href="/dashboard" 
                    className="px-8 py-4 bg-white text-[#E88C6D] rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-orange-900/10"
                  >
                    Get Started for Free
                  </Link>
                  <Link 
                    href="#" 
                    className="px-8 py-4 bg-[#D07050] text-white rounded-xl font-bold hover:bg-[#C06040] transition-colors border border-white/20"
                  >
                    View Demo
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#FAF9F6] border-t border-gray-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#E88C6D] rounded text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17V7H17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-gray-700">AlgoSync</span>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-500 font-medium">
               <a href="#" className="hover:text-[#E88C6D]">Twitter</a>
               <a href="#" className="hover:text-[#E88C6D]">GitHub</a>
               <a href="#" className="hover:text-[#E88C6D]">Support</a>
               <a href="#" className="hover:text-[#E88C6D]">Privacy</a>
            </div>
            
            <div className="text-xs text-gray-400">
               © 2024 AlgoSync. Crafted for the grind.
            </div>
         </div>
      </footer>
    </div>
  );
}