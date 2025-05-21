
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Landmark, User, Bike, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { todaZones } from '@/data/todaZones';
import type { TodaZone } from '@/types';
import { useToast } from "@/hooks/use-toast";

const TriGoCentralLogo = () => (
  <a
    href="https://trigo.live"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block mb-6 group perspective"
    aria-label="Visit TriGo Live"
  >
    <div
      className="
        bg-white/20
        backdrop-blur-md
        border border-white/20
        w-32 h-28
        flex items-center justify-center
        relative
        transition-all duration-500 ease-in-out
        transform-style-3d
        group-hover:rotate-y-180
        electric-animation
      "
      style={{
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      }}
    >
      <div className="w-full h-full flex items-center justify-center
                      transform transition-transform duration-300
                      group-hover:scale-95
                      relative z-10
                      pt-3">
        <svg width="512" height="512" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
          <defs>
            <linearGradient id="homepageAutoGradient" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#46E8BD"/>
              <stop offset="30%" stopColor="#30F0A0"/>
              <stop offset="60%" stopColor="#10FF70"/>
              <stop offset="100%" stopColor="#00FF00"/>
            </linearGradient>
            <filter id="homepageNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.8" result="coloredBlur"/>
            </filter>
            <g id="homepage-auto-rickshaw-shapes" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 60 130 L 60 100 Q 65 90 75 90 L 125 90 Q 135 90 140 100 L 150 100 L 155 105 L 155 125 Q 155 135 145 140 L 80 140 Q 70 140 65 130 Z" />
                <path d="M 75 90 Q 100 87 125 90" />
                <path d="M 95 90 L 95 140" />
                <path d="M 125 90 L 125 140" />
                <line x1="130" y1="115" x2="134" y2="115" />
                <circle cx="80" cy="142" r="13" />
                <circle cx="80" cy="142" r="5" />
                <circle cx="150" cy="142" r="11" />
                <path d="M 140 100 L 148 115 L 150 131" />
                <circle cx="143" cy="102" r="3" />
            </g>
          </defs>
          <g transform="translate(20.5, 5.5)">
            <use href="#homepage-auto-rickshaw-shapes" stroke="url(#homepageAutoGradient)" strokeWidth="6" filter="url(#homepageNeonGlow)"/>
            <use href="#homepage-auto-rickshaw-shapes" stroke="url(#homepageAutoGradient)" strokeWidth="2"/>
          </g>
        </svg>
      </div>
    </div>
  </a>
);

const NetworkNode: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-2 h-2 md:w-3 md:h-3 bg-blue-500/50 rounded-full animate-pulse-soft"
    style={style}
  ></div>
);

const NetworkLine: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute h-px bg-blue-400/30"
    style={{...style, animation: 'line-flow-animation 10s infinite linear'}}
  ></div>
);


export default function ZoneLauncherPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedZone, setSelectedZone] = React.useState<TodaZone | null>(null);

  const nodes = [
    { top: '10%', left: '15%' }, { top: '20%', left: '80%' },
    { top: '50%', left: '5%' },  { top: '60%', left: '90%' },
    { top: '85%', left: '25%' }, { top: '90%', left: '70%' },
    { top: '30%', left: '40%' }, { top: '70%', left: '60%' },
  ];

  const lines = [
    { top: '15%', left: '16%', width: '64%', transform: 'rotate(7deg)'},
    { top: '30%', left: '6%', width: '10%', transform: 'rotate(-45deg)'},
    { top: '40%', left: '6%', width: '34%', transform: 'rotate(15deg)'},
    { top: '40%', left: '80%', width: '10%', transform: 'rotate(120deg)'},
    { top: '65%', left: '61%', width: '29%', transform: 'rotate(-8deg)'},
    { top: '87%', left: '26%', width: '44%', transform: 'rotate(4deg)'},
  ];

  const handleZoneSelect = (zone: TodaZone) => {
    setSelectedZone(zone);
    try {
      localStorage.setItem("selectedTodaZoneId_TriGo", zone.id);
      localStorage.setItem("selectedTodaZoneName_TriGo", zone.name);
      toast({
        title: "Zone Selected",
        description: `You've selected ${zone.name}. Now choose your role.`,
      });
    } catch (error) {
      console.error("Error saving zone to localStorage:", error);
      toast({
        title: "Selection Error",
        description: "Could not save zone selection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = (role: 'passenger' | 'trider') => {
    if (!selectedZone) {
      toast({
        title: "No Zone Selected",
        description: "Please select a TODA zone first.",
        variant: "destructive",
      });
      return;
    }
    try {
      localStorage.setItem("selectedRole_TriGo", role);
      window.open(`/${role}`, "_blank");
    } catch (error) {
      console.error("Error saving role to localStorage:", error);
      toast({
        title: "Navigation Error",
        description: "Could not proceed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bfrvZone = todaZones.find(z => z.id === '6'); // BF Vista Grande

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 sm:p-8 overflow-hidden relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-600/30 rounded-full blur-[150px] animate-bg-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-blue-500/30 rounded-full blur-[120px] animate-bg-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/5 w-1/4 h-1/4 bg-green-500/20 rounded-full blur-[100px] animate-bg-pulse-slow animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 z-0 opacity-50">
        {nodes.map((node, i) => <NetworkNode key={`node-${i}`} style={node} />)}
        {lines.map((line, i) => <NetworkLine key={`line-${i}`} style={line} />)}
      </div>

      <div className="relative z-10 text-center mb-8 sm:mb-12 animate-fadeIn">
        <TriGoCentralLogo />
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-3 text-shadow-lg">Welcome to TriGo</h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-md mx-auto text-shadow">
          Select your TODA zone to begin.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6 animate-slideUp">
        <Card className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/60 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Select TODA Zone</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Choose your current operational area.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4">
            {(bfrvZone ? [bfrvZone, ...todaZones.filter(z => z.id !== '6')] : todaZones).map((zone) => (
              <Button
                key={zone.id}
                variant={selectedZone?.id === zone.id ? "default" : "outline"}
                className={`w-full h-auto p-3 flex flex-col items-center justify-center text-center
                            ${selectedZone?.id === zone.id ? 'bg-primary text-primary-foreground border-primary ring-2 ring-offset-2 ring-offset-slate-900 ring-primary' :
                            'bg-slate-800/50 border-slate-700 hover:bg-slate-700/70 hover:border-primary/70 text-slate-200'}
                            transition-all duration-200 ease-in-out transform hover:scale-105`}
                onClick={() => handleZoneSelect(zone)}
              >
                <Landmark className="w-8 h-8 mb-2 text-primary" />
                <span className="font-semibold text-sm">{zone.name}</span>
                <span className="text-xs text-slate-400 truncate w-full px-1">{zone.areaOfOperation}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {selectedZone && (
          <Card className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/60 shadow-2xl animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Proceed as: <span className="text-primary">{selectedZone.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold group/button relative z-10 transition-transform duration-300 hover:scale-105"
                onClick={() => handleRoleSelect('passenger')}
              >
                <User className="mr-2 h-5 w-5" />
                Passenger
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold group/button relative z-10 transition-transform duration-300 hover:scale-105"
                onClick={() => handleRoleSelect('trider')}
              >
                <Bike className="mr-2 h-5 w-5" />
                Trider
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        )}
         <div className="text-center mt-8">
            <Button variant="link" onClick={() => router.push('/dispatcher')} className="text-slate-400 hover:text-primary">
                Go to Dispatcher Dashboard
            </Button>
        </div>
      </div>

      <style jsx global>{`
        .text-shadow { text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .text-shadow-lg { text-shadow: 0 2px 5px rgba(0,0,0,0.4); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.7s ease-out 0.2s forwards;
          opacity: 0;
        }

        @keyframes bg-pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        .animate-bg-pulse-slow {
          animation: bg-pulse-slow 12s infinite ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
        }
        .animate-sparkle {
          animation: sparkle 0.6s ease-in-out forwards;
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s infinite ease-in-out;
        }

        @keyframes line-flow-animation {
          /* Placeholder for more complex line animation if needed */
        }

        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }

        @keyframes electric-pulse {
          0%, 100% {
            box-shadow:
              0 0 8px rgba(120, 255, 200, 0.6),
              0 0 16px rgba(100, 225, 180, 0.5),
              0 0 28px rgba(80, 200, 160, 0.4),
              0 0 40px rgba(60, 180, 140, 0.3);
          }
          50% {
            box-shadow:
              0 0 12px rgba(150, 255, 220, 0.8),
              0 0 24px rgba(120, 255, 200, 0.7),
              0 0 40px rgba(100, 225, 180, 0.6),
              0 0 60px rgba(80, 200, 160, 0.5);
          }
        }
        .electric-animation {
          animation: electric-pulse 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
