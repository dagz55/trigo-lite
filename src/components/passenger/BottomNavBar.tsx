"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Home, Search, User } from "lucide-react";

interface BottomNavBarProps {}

const BottomNavBar: React.FC<BottomNavBarProps> = ({}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md py-2">
      <div className="container mx-auto flex justify-around">
        <button className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors duration-200">
          <Home className="h-6 w-6 text-white" />
        </button>
        <button className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors duration-200">
          <Search className="h-6 w-6 text-white" />
        </button>
        <button className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors duration-200">
          <User className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar;
