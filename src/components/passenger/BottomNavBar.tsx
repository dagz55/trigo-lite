import React from 'react';
import Link from 'next/link';
import { Home, Map, User } from 'lucide-react'; // Example icons, adjust as needed

const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16">
      <Link href="/passenger" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600">
        <Home size={24} />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/passenger/map" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600">
        <Map size={24} />
        <span className="text-xs">Map</span>
      </Link>
      <Link href="/passenger/profile" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600">
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavBar;
