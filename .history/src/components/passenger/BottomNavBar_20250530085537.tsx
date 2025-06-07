"use client";

import { cn } from '@/lib/utils';
import { Home, Map, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/passenger',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/passenger'
    },
    {
      href: '/passenger/map',
      icon: Map,
      label: 'Ride',
      isActive: pathname === '/passenger/map'
    },
    {
      href: '/passenger/profile',
      icon: User,
      label: 'Profile',
      isActive: pathname === '/passenger/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Apple-style glass morphism background */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
        <div className="flex justify-around items-center h-20 px-4 safe-area-pb">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all duration-300 ease-out",
                  item.isActive
                    ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-600 scale-105"
                    : "text-gray-500 hover:text-purple-500 hover:bg-purple-50/50 active:scale-95",
                  item.label === 'Ride' && 'hover:scale-110 active:scale-90'
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  item.isActive
                    ? "bg-purple-100/80 shadow-sm"
                    : "hover:bg-purple-50/30"
                )}>
                  <Icon
                    size={22}
                    className={cn(
                      "transition-all duration-300",
                      item.isActive ? "text-purple-600" : "text-gray-500"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-300",
                  item.isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-500"
                )}>
                  {item.label}
                </span>
                {item.isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
