import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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

const MoonIcon = () => (
    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-[#FFFBF7]/80 backdrop-blur-md border-b border-[#F5E6E0]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon />
          <span className="font-bold text-xl text-gray-900 tracking-tight">AlgoSync</span>
        </Link>
        
        <div className="flex items-center gap-8">
          
          <Link href="dashboard" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-[#1C1C1C] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
