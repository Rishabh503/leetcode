import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
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
