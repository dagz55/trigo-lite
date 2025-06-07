"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function PassengerSettingsPage() {
  return (
    <div className="bg-gray-50 text-black flex flex-col h-screen">
      {/* Apple-style Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center space-x-3">
          <Link href="/passenger/profile" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200" title="Back to Profile">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-20 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Placeholder for settings options */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <p className="text-gray-600">More settings options will be available here soon.</p>
            {/* Add more settings components here */}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
