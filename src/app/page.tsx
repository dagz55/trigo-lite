
"use client";

import * as React from 'react';
import Link from 'next/link';
import { User, Bike, Phone, Settings as AdminIconSettings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Updated TriGoCentralLogo
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
      {/* Icon wrapper for consistent centering */}
      <div className="w-full h-full flex items-center justify-center 
                      transform transition-transform duration-300 
                      group-hover:scale-95 
                      relative z-10 
                      pt-3">
        <Bike 
          className="w-16 h-16 text-white" 
          data-ai-hint="tricycle logo"
        />
      </div>
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
    // For regular links, use Next.js Link or simple anchor if opening new tab
    if (openInNewTab) {
      window.open(href, '_blank');
    } else {
      // If you want to navigate within the app, use Next.js Link (or router for programmatic nav)
      // This example assumes button directly handles window.open or is wrapped by <Link> if same-tab nav
      // For simplicity, direct window.open for all button clicks handled here
      if (href.startsWith('/')) { // Basic check for internal links
         window.open(href, '_blank'); // Defaulting to new tab for all for now
      } else {
         window.open(href, '_blank');
      }
    }
  };
  
  // If we want to use Next/Link for same-tab navigation, the button should be wrapped by it,
  // or the onClick handler should use Next's router.
  // For this component, we'll stick to window.open for new tabs as per original design.
  const actualHref = href.startsWith('/') && !openInNewTab ? href : '#'; // Prepare for Link if needed

  const cardButton = (
     <Button
        onClick={handleClick}
        className={`${buttonColorClass} text-white font-semibold group/button w-full mt-auto relative z-10 transition-transform duration-300 group-hover:scale-105`}
      >
        {buttonText}
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
      </Button>
  );


  return (
    <div 
      className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/60 rounded-xl p-6 flex flex-col items-center text-center shadow-2xl w-full sm:w-72 h-80 justify-between transition-all duration-300 ease-in-out hover:scale-105 hover:border-slate-500/80 hover:shadow-blue-500/20 relative overflow-hidden group"
    >
      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-card-shine group-hover:left-full transition-all duration-1000 opacity-0 group-hover:opacity-100"></div>
      
      <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-sparkle delay-100"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-sparkle delay-200"></div>
      <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-sparkle delay-300"></div>
      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-sparkle delay-400"></div>


      <div className="relative z-10">
        <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColorClass} transition-transform duration-300 group-hover:scale-110`} />
        <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-4 h-12 overflow-hidden">{description}</p>
      </div>
      {cardButton}
    </div>
  );
};


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


export default function HomePage() {
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
      
      <div className="relative z-10 text-center mb-10 sm:mb-16 animate-fadeIn">
        <TriGoCentralLogo />
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 text-shadow-lg">TriGo</h1>
        <p className="text-lg sm:text-2xl text-slate-300 max-w-lg mx-auto text-shadow">
          Ride-hailing for Filipino tricycle communities
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-slideUp">
        <RoleCard
          icon={User}
          title="Passenger"
          description="Book rides and track your journey live"
          buttonText="Select Role"
          href="/passenger"
          iconColorClass="text-purple-400"
          buttonColorClass="bg-purple-600 hover:bg-purple-500"
          openInNewTab={true}
        />
        <RoleCard
          icon={Bike}
          title="Trider"
          description="Accept requests and manage your trips"
          buttonText="Select Role"
          href="/trider"
          iconColorClass="text-blue-400"
          buttonColorClass="bg-blue-600 hover:bg-blue-500"
          openInNewTab={true}
        />
        <RoleCard
          icon={Phone}
          title="Dispatcher"
          description="Coordinate rides & manage operations"
          buttonText="Select Role"
          href="/dispatcher"
          iconColorClass="text-yellow-400"
          buttonColorClass="bg-yellow-500 hover:bg-yellow-400"
          openInNewTab={false} 
        />
        <RoleCard
          icon={AdminIconSettings}
          title="Admin"
          description="Oversee system and configure settings"
          buttonText="Select Role"
          href="/dispatcher/admin-dashboard" 
          iconColorClass="text-emerald-400"
          buttonColorClass="bg-emerald-600 hover:bg-emerald-500"
          openInNewTab={true} 
        />
      </div>

      <style jsx global>{`
        .text-shadow { text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .text-shadow-lg { text-shadow: 0 2px 5px rgba(0,0,0,0.4); }
        
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
        
        @keyframes bg-pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        .animate-bg-pulse-slow {
          animation: bg-pulse-slow 12s infinite ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes card-shine { 
          0% { transform: translateX(-120%) skewX(-30deg); opacity: 0.1; }
          20% { opacity: 0.3; }
          60% { opacity: 0.3; }
          100% { transform: translateX(120%) skewX(-30deg); opacity: 0.1; }
        }
        .animate-card-shine {
          animation: card-shine 1s ease-in-out;
        }

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
              0 0 6px rgba(200, 225, 255, 0.7), 
              0 0 12px rgba(100, 180, 255, 0.6), 
              0 0 20px rgba(0, 150, 255, 0.5),
              0 0 30px rgba(0, 150, 255, 0.4);
          }
          50% { 
            box-shadow: 
              0 0 10px rgba(225, 255, 255, 0.9), 
              0 0 20px rgba(150, 200, 255, 0.8), 
              0 0 35px rgba(50, 180, 255, 0.7),
              0 0 50px rgba(50, 180, 255, 0.6);
          }
        }
        .electric-animation {
          animation: electric-pulse 1.2s infinite ease-in-out;
        }

      `}</style>
    </div>
  );
}

