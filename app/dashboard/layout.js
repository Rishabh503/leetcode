"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        
        if (!data.exists || !data.leetcodeUsername) {
          router.push('/onboarding');
        } else {
          setChecking(false);
        }
      } catch (e) {
        console.error(e);
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (checking) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E88C6D]"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <Navbar />
      <div className="flex pt-[72px] h-screen overflow-hidden">
         <Sidebar />
         <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-72px)]">
            {children}
         </main>
      </div>
    </div>
  );
}
