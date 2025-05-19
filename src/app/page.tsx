
"use client";

import * as React from 'react';
import Link from 'next/link';
import { User, Bike, Phone, Settings as AdminIcon, ArrowRight } from 'lucide-react'; // Renamed Settings to AdminIcon to avoid conflict
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription might not be needed if text is simple

// Simplified TriGo Logo (Bike icon in a styled container)
const TriGoCentralLogo = () => (
  <a 
    href="https://trigo.live" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="inline-block mb-4 transition-transform hover:scale-105"
    aria-label="Visit TriGo Live"
  >
    <div className="bg-white/20 p-4 rounded-2xl shadow-lg w-28 h-28 flex items-center justify-center border border-white/30">
      <Bike className="w-16 h-16 text-white" />
    </div>
  </a>
);

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  iconColorClass: string;
  buttonColorClass: string;
  openInNewTab?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
  iconColorClass,
  buttonColorClass,
  openInNewTab = true,
}) => {
  const handleClick = () => {
    if (openInNewTab) {
      window.open(href, '_blank');
    } else {
      // For internal navigation if needed, though spec says new window for roles
      // This would require NextLink or router.push
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 flex flex-col items-center text-center shadow-2xl w-full sm:w-64 h-80 justify-between transition-all hover:scale-105 hover:border-slate-600">
      <div>
        <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColorClass}`} />
        <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-4">{description}</p>
      </div>
      <Button 
        onClick={handleClick} 
        className={`${buttonColorClass} text-white font-semibold group w-full`}
      >
        {buttonText}
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-4 sm:p-8 overflow-hidden">
      <div className="text-center mb-12 animate-fadeIn">
        <TriGoCentralLogo />
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3">TriGo</h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-md mx-auto">
          Ride-hailing for Filipino tricycle communities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-slideUp">
        <RoleCard
          icon={User}
          title="Passenger"
          description="Book rides and track your journey"
          buttonText="Select Role"
          href="/passenger"
          iconColorClass="text-purple-400"
          buttonColorClass="bg-purple-600 hover:bg-purple-700"
        />
        <RoleCard
          icon={Bike}
          title="Trider"
          description="Accept ride requests and manage trips"
          buttonText="Select Role"
          href="/trider"
          iconColorClass="text-blue-400"
          buttonColorClass="bg-blue-600 hover:bg-blue-700"
        />
        <RoleCard
          icon={Phone}
          title="Dispatcher"
          description="Coordinate rides and manage operations"
          buttonText="Select Role"
          href="/dispatcher" 
          iconColorClass="text-yellow-400"
          buttonColorClass="bg-yellow-500 hover:bg-yellow-600"
        />
        <RoleCard
          icon={AdminIcon}
          title="Admin"
          description="Oversee system and access all features"
          buttonText="Select Role"
          href="/dispatcher/settings" // Placeholder link for Admin
          iconColorClass="text-emerald-400"
          buttonColorClass="bg-emerald-600 hover:bg-emerald-700"
        />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out 0.3s forwards;
          opacity: 0; 
        }
      `}</style>
    </div>
  );
}
