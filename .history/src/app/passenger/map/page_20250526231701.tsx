"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Layers, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

export default function PassengerMapPage() {
  return (
    <div className="bg-white text-black flex flex-col h-screen">
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between shadow-md z-20 relative">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
            <Link href="/passenger">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-purple-400">Map View</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                Interactive Map
              </CardTitle>
              <CardDescription>
                Explore the map with enhanced features and controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p>Enhanced Map View</p>
                  <p className="text-sm">Coming Soon!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center">
                  <Navigation className="mr-2 h-4 w-4" />
                  Navigate
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Layers className="mr-2 h-4 w-4" />
                  Layers
                </Button>
              </div>
            </CardContent>
          </Card>

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
