"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Layers, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

export default function PassengerMapPage() {
  return (
    <div className="bg-gray-50 text-black flex flex-col h-screen">
      {/* Apple-style Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center space-x-3">
          <Link href="/passenger" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200" title="Back to Home">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Map View</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Apple-style Map Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-xl mr-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Interactive Map</h2>
                  <p className="text-sm text-gray-600">Explore with enhanced features and controls</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-64 rounded-2xl flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 inline-block">
                    <MapPin size={32} className="text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-700">Enhanced Map View</p>
                  <p className="text-sm text-gray-500">Coming Soon!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button type="button" className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium">
                  <Navigation className="mr-2 h-4 w-4" />
                  Navigate
                </button>
                <button type="button" className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium">
                  <Layers className="mr-2 h-4 w-4" />
                  Layers
                </button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Map Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Real-time trider locations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  TODA zone boundaries
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Route optimization
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Traffic conditions
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
