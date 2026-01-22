'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Calendar, 
  History, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Target
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Today', href: '/dashboard/today', icon: Target },
    { name: 'Week', href: '/dashboard/week', icon: CalendarDays },
    { name: 'Month', href: '/dashboard/month', icon: Calendar },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Reminders', href: '/dashboard/reminders', icon: Bell },
  ];

  return (
    <div 
      className={`bg-white border-r border-[#F5E6E0] h-full sticky top-0 pt-4 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="absolute right-[-12px] top-9 bg-white border border-[#F5E6E0] rounded-full p-1.5 cursor-pointer header-toggle z-10 hover:bg-gray-50 shadow-sm text-gray-500"
           onClick={() => setCollapsed(!collapsed)}>
           {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </div>

      <div className="flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#FFF0EB] text-[#E88C6D] font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
