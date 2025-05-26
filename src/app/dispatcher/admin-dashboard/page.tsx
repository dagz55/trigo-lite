
"use client";

import * as React from 'react';
import AdminChatManager from "@/components/chat/AdminChatManager";
import {
  Users, Bike, DollarSign, CheckCircle, TrendingUp, Clock, Activity as ActivityIcon, ShieldCheck,
  Settings as SettingsIconLucide, FileText, Database, Bell, UserCircle2, ListFilter,
  CreditCard, RefreshCw, Users2, Cog, BarChart2, Shield, FileDigit, BellRing, Banknote, CalendarDays
} from 'lucide-react'; // Added CalendarDays
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge"; // Added Badge import
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Helper for animated counters (simple version for mockup)
const useAnimatedCounter = (targetValue: number, duration: number = 700) => {
  const [count, setCount] = React.useState(0); // Start from 0 or a sensible initial
  const previousValueRef = React.useRef(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = previousValueRef.current; // Animate from previous target/value

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(startValue + (targetValue - startValue) * progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(targetValue); // Ensure it ends on the exact value
        previousValueRef.current = targetValue; // Store for next animation
      }
    };
    
    // Only animate if target actually changed significantly to avoid micro-animations
    if (Math.abs(targetValue - startValue) > 0) {
        requestAnimationFrame(step);
    } else {
        setCount(targetValue); // Instant set if no real change or first render
        previousValueRef.current = targetValue;
    }

    // Cleanup on unmount or if targetValue/duration changes before animation completes
    return () => {
      startTimestamp = null; // This would effectively stop an ongoing animation if re-triggered
    };

  }, [targetValue, duration]);

  return count;
};


// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString(); // Use toLocaleString for commas
};

interface ActivityItem {
  id: number;
  icon: React.ElementType;
  color: string;
  bgColor: string; // Added bgColor for consistency with other uses
  description: string;
  tag: string;
  time: Date;
}

// Main Admin Dashboard Component
export default function AdminDashboardPage() {
  const { toast } = useToast();

  // State for Platform Statistics
  const [totalUsers, setTotalUsers] = React.useState(21651);
  const [totalTriders, setTotalTriders] = React.useState(3263);
  const [completedRides, setCompletedRides] = React.useState(62207);
  
  const weeklyRevenue = React.useMemo(() => completedRides * 10, [completedRides]);

  const animatedTotalUsers = useAnimatedCounter(totalUsers);
  const animatedTotalTriders = useAnimatedCounter(totalTriders);
  const animatedCompletedRides = useAnimatedCounter(completedRides);
  const animatedWeeklyRevenue = useAnimatedCounter(weeklyRevenue);
  
  // State for Platform Activity Chart
  const [activityData, setActivityData] = React.useState(
    Array.from({ length: 24 }, (_, i) => ({
      name: `${i % 12 === 0 ? 12 : i % 12}${i < 12 || i === 23 ? 'AM' : 'PM'}`, // Simpler time labels
      passengers: 0,
      triders: 0,
    }))
  );

  // State for Performance Metrics
  const [responseTime, setResponseTime] = React.useState(128);
  const [triderAvailability, setTriderAvailability] = React.useState(75);
  const [passengerSatisfaction, setPassengerSatisfaction] = React.useState(96);
  const [paymentSuccessRate, setPaymentSuccessRate] = React.useState(99.7);
  
  const [lastPerfUpdate, setLastPerfUpdate] = React.useState<string | null>(null);


  // State for Recent Activity Feed
  const [recentActivities, setRecentActivities] = React.useState<ActivityItem[]>([]);

  // Mock data updates for Platform Statistics (every 3 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTotalUsers(prev => prev + Math.floor(Math.random() * 20) + 5);
      setTotalTriders(prev => prev + Math.floor(Math.random() * 5) + 1);
      setCompletedRides(prev => prev + Math.floor(Math.random() * 15) + 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Mock data updates for Platform Activity Chart (every 5 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivityData(prevData => {
        const lastPointTime = new Date(); // Use current time to derive next label
        const currentHour = lastPointTime.getHours();
        
        const newDataPoint = {
          name: `${currentHour % 12 === 0 ? 12 : currentHour % 12}${currentHour < 12 ? 'AM' : 'PM'}`,
          passengers: Math.floor(Math.random() * 150) + 50, // Increased range
          triders: Math.floor(Math.random() * 50) + 10,    // Increased range
        };
        // Add new point and remove the oldest
        const updatedData = [...prevData.slice(1), newDataPoint];
        return updatedData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock data updates for Performance Metrics (every 5 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setResponseTime(Math.floor(Math.random() * 80) + 80); // 80ms - 160ms
      setTriderAvailability(Math.floor(Math.random() * 20) + 70); // 70% - 90%
      setPassengerSatisfaction(Math.max(90, Math.floor(Math.random() * 10) + 90)); // 90% - 99%
      setPaymentSuccessRate(parseFloat((Math.random() * 0.3 + 99.5).toFixed(1))); // 99.5% - 99.8%
      setLastPerfUpdate(Date.now().toString()); // Trigger re-render for pulse effect
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Mock data updates for Recent Activity (every 4 seconds)
  React.useEffect(() => {
    const activityTemplates = [
      { icon: CreditCard, tag: "Finance", color: "text-purple-600", bgColor: "bg-purple-100" },
      { icon: CheckCircle, tag: "Rides", color: "text-green-600", bgColor: "bg-green-100" },
      { icon: RefreshCw, tag: "System", color: "text-blue-600", bgColor: "bg-blue-100" },
      { icon: UserCircle2, tag: "Triders", color: "text-orange-600", bgColor: "bg-orange-100" },
    ];
    const names = ["Maria S.", "Juan P.", "Pedro K.", "Sofia L.", "Robert M."];
    const locations = ["Makati", "BGC", "Pasig", "QC", "Alabang", "Mandaluyong"];
    const versions = ["3.8.2", "3.8.3", "3.9.0", "3.9.1"];

    const generateDescription = (template: typeof activityTemplates[0]) => {
        switch(template.tag) {
            case "Finance": return `Payment Processed: Weekly payouts of ₱${(Math.floor(Math.random() * 500) + 1000) * 100} to triders.`;
            case "Rides": return `Ride Completed: ${names[Math.floor(Math.random() * names.length)]} finished a ${ (Math.random() * 10 + 2).toFixed(1) }km ride from ${locations[Math.floor(Math.random() * locations.length)]} to ${locations[Math.floor(Math.random() * locations.length)]}.`;
            case "System": return `System Update: TriGo system updated to version ${versions[Math.floor(Math.random() * versions.length)]} successfully.`;
            case "Triders": return `Driver Verification: ${names[Math.floor(Math.random() * names.length)]} submitted verification documents.`;
            default: return "New system alert generated.";
        }
    };

    const interval = setInterval(() => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const newActivity: ActivityItem = {
        id: Date.now(),
        icon: template.icon,
        color: template.color,
        bgColor: template.bgColor,
        description: generateDescription(template),
        tag: template.tag,
        time: new Date(),
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  
  const quickAccessItems = [
    { icon: Users2, label: "User Management", description: "Administer users & roles", href: "#" },
    { icon: Cog, label: "Configuration", description: "System module and parameters", href: "/dispatcher/settings" },
    { icon: BarChart2, label: "Reports", description: "Generate data & system reports", href: "#" },
    { icon: Shield, label: "Security", description: "Access control and logs", href: "#" },
    { icon: Database, label: "Database", description: "Browse data and manage backups", href: "#" },
    { icon: FileDigit, label: "Logs", description: "System and application logs", href: "#" },
    { icon: BellRing, label: "Notifications", description: "Manage user notifications", href: "#" },
    { icon: Banknote, label: "Finance", description: "Oversee system financial records", href: "/dispatcher/wallet" },
  ];

  // Colors based on screenshot (Light/Neo-mint theme)
  const adminDashboardPrimaryColor = "hsl(150, 65%, 50%)"; // Main green from banner
  const adminDashboardPrimaryLight = "hsl(150, 65%, 95%)"; // Very light green for backgrounds or hovers
  const adminDashboardTextPrimary = "hsl(220, 25%, 25%)"; // Darker text for titles
  const adminDashboardTextSecondary = "hsl(220, 15%, 45%)"; // Normal text
  const adminDashboardTextMuted = "hsl(220, 15%, 65%)";   // Muted text
  const adminDashboardCardBg = "hsl(0, 0%, 100%)";         // White cards
  const adminDashboardPageBg = "hsl(210, 40%, 98%)";      // Very light gray/blue page background
  const adminDashboardBorder = "hsl(210, 30%, 93%)";      // Subtle border

  return (
    <div className="min-h-screen" style={{ backgroundColor: adminDashboardPageBg, color: adminDashboardTextSecondary, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header 
        className="flex justify-between items-center px-6 md:px-8 py-4" 
        style={{ backgroundColor: adminDashboardCardBg, borderBottom: `1px solid ${adminDashboardBorder}` }}
      >
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: adminDashboardTextPrimary }}>Welcome to TriGo Admin</h1>
          <p style={{ color: adminDashboardTextMuted }}>Manage and oversee the entire TriGo platform.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell size={20}/>
                <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/40x40.png?text=AA" alt="Admin Account" data-ai-hint="admin person"/>
                    <AvatarFallback>AA</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline" style={{ color: adminDashboardTextSecondary }}>Admin Account</span>
            </div>
        </div>
      </header>

      <main className="p-6 md:p-8 space-y-8">
        {/* Platform Statistics */}
        <section 
            className="p-6 rounded-lg shadow-sm"
            style={{ backgroundColor: adminDashboardPrimaryColor, color: "white" }}
        >
          <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total Users", value: formatNumber(animatedTotalUsers) },
              { icon: Bike, label: "Triders", value: formatNumber(animatedTotalTriders) },
              { icon: DollarSign, label: "Weekly Revenue", value: `₱${formatNumber(animatedWeeklyRevenue)}` },
              { icon: CheckCircle, label: "Completed Rides", value: formatNumber(animatedCompletedRides) },
            ].map(stat => (
              <div key={stat.label} className="bg-white/25 p-4 rounded-md flex items-center space-x-3 transition-all hover:bg-white/35 cursor-default">
                <stat.icon size={28} className="text-white flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Activity & Performance Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm" style={{ backgroundColor: adminDashboardCardBg, borderColor: adminDashboardBorder }}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg" style={{ color: adminDashboardTextPrimary }}>
                <TrendingUp className="mr-2" style={{ color: adminDashboardPrimaryColor }} /> Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={adminDashboardBorder} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: adminDashboardTextMuted }} axisLine={{stroke: adminDashboardBorder}} tickLine={{stroke: adminDashboardBorder}} />
                  <YAxis tick={{ fontSize: 10, fill: adminDashboardTextMuted }} axisLine={{stroke: adminDashboardBorder}} tickLine={{stroke: adminDashboardBorder}}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: adminDashboardCardBg, borderColor: adminDashboardBorder, borderRadius: '0.375rem', boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" }} 
                    itemStyle={{color: adminDashboardTextSecondary}} 
                    labelStyle={{color: adminDashboardTextPrimary, fontWeight: '500'}}
                  />
                  <Legend iconSize={10} wrapperStyle={{fontSize: '12px', color: adminDashboardTextMuted, paddingTop: '10px'}}/>
                  <Line type="monotone" dataKey="passengers" stroke={adminDashboardPrimaryColor} strokeWidth={2} dot={false} name="Passengers Online" />
                  <Line type="monotone" dataKey="triders" stroke={"hsl(200, 80%, 60%)"} strokeWidth={2} dot={false} name="Triders Online" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm" style={{ backgroundColor: adminDashboardCardBg, borderColor: adminDashboardBorder }}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg" style={{ color: adminDashboardTextPrimary }}>
                <ActivityIcon className="mr-2" style={{ color: adminDashboardPrimaryColor }} /> Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "System Response Time", value: `${responseTime}ms (avg)`, progress: Math.max(0, 100 - (responseTime / 3)) }, // Adjusted for better visualization
                { label: "Trider Availability", value: `${triderAvailability}%`, progress: triderAvailability },
                { label: "Passenger Satisfaction", value: `${passengerSatisfaction}%`, progress: passengerSatisfaction },
                { label: "Payment Success Rate", value: `${paymentSuccessRate}%`, progress: paymentSuccessRate },
              ].map(metric => (
                <div key={metric.label} className={cn(lastPerfUpdate && 'animate-pulse-once')}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{color: adminDashboardTextSecondary}}>{metric.label}</span>
                    <span className="text-sm font-medium" style={{color: adminDashboardTextPrimary}}>{metric.value}</span>
                  </div>
                  <Progress
                    value={metric.progress}
                    className={cn(
                        "h-2 [&>div]:transition-all [&>div]:duration-500",
                        metric.progress > 80 ? "[&>div]:bg-[#34D399]" : 
                        metric.progress > 50 ? "[&>div]:bg-[#FBBF24]" : 
                        "[&>div]:bg-[#F87171]"
                    )}
                  />
                </div>
              ))}
                <Button variant="outline" className="w-full mt-4 text-sm hover:bg-gray-50" style={{borderColor: adminDashboardBorder, color: adminDashboardPrimaryColor}}>
                    <BarChart2 size={16} className="mr-2"/> View Detailed Reports
                </Button>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <Card className="shadow-sm" style={{ backgroundColor: adminDashboardCardBg, borderColor: adminDashboardBorder }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg" style={{ color: adminDashboardTextPrimary }}>Recent Activity</CardTitle>
                <Button variant="link" className="text-sm -mr-2" style={{color: adminDashboardPrimaryColor}}>View all</Button>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[280px] pr-3 -mr-3">
                <ul className="space-y-1">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50/70 transition-colors group">
                      <div className={cn("p-2 rounded-full flex items-center justify-center", activity.bgColor)}>
                        <activity.icon size={16} className={cn(activity.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{color: adminDashboardTextSecondary}}>{activity.description}</p>
                        <div className="flex items-center justify-between text-xs mt-1">
                           <Badge variant="outline" className="font-normal text-xs py-0.5 px-1.5" style={{borderColor: adminDashboardBorder, color: adminDashboardTextMuted, backgroundColor: adminDashboardPageBg}}>{activity.tag}</Badge>
                           <span style={{color: adminDashboardTextMuted}}>{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {recentActivities.length === 0 && <p className="text-center text-sm py-4" style={{color: adminDashboardTextMuted}}>No recent activities.</p>}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: adminDashboardTextPrimary }}>Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {quickAccessItems.map(item => (
              <a // Changed to <a> tag for navigation
                key={item.label} 
                href={item.href} // Use href for navigation
                onClick={(e) => {
                    if (item.href === "#") {
                        e.preventDefault();
                        toast({title: "Feature Not Implemented", description: `${item.label} section is a placeholder.`});
                    }
                }}
                className="block text-center p-4 rounded-lg transition-all duration-300 group hover:shadow-xl hover:-translate-y-0.5"
                style={{
                    backgroundColor: "hsla(0, 0%, 100%, 0.7)", 
                    backdropFilter: "blur(8px)", 
                    border: `1px solid ${adminDashboardBorder}`,
                    WebkitBackdropFilter: "blur(8px)" // For Safari
                }}
              >
                <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{backgroundColor: adminDashboardPrimaryLight}}
                >
                    <item.icon size={24} style={{color: adminDashboardPrimaryColor}} />
                </div>
                <h3 className="font-medium text-sm" style={{color: adminDashboardTextPrimary}}>{item.label}</h3>
                <p className="text-xs mt-0.5 hidden sm:block" style={{color: adminDashboardTextMuted}}>{item.description}</p>
              </a>
            ))}
          </div>
        </section>
        <AdminChatManager 
          supabase={null} // Replace with actual Supabase instance
          adminUser={null} // Replace with actual admin user
        />
      </main>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .animate-pulse-once {
            animation: pulse-once 0.7s ease-out;
        }
        @keyframes pulse-once {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
