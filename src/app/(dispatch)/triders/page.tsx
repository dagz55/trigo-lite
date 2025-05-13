
"use client";

import * as React from 'react';
import type { TriderProfile, TodaZone, ChatMessage, TriderExtendedStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TridersTable } from '@/components/triders/TridersTable';
import { TriderDetailPanel } from '@/components/triders/TriderDetailPanel';
import { TriderChatSheet } from '@/components/triders/TriderChatSheet';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Search } from 'lucide-react';

// Mock Data - Extending initialTriders from dispatch page for more details
const initialTridersProfiles: TriderProfile[] = [
  { 
    id: 'trider-1', name: 'Juan Dela Cruz', 
    location: { latitude: 14.440300, longitude: 121.000600 }, 
    status: 'available', vehicleType: 'Tricycle', todaZoneId: '1', todaZoneName: 'ACAPODA',
    contactNumber: '+639171234567', profilePictureUrl: 'https://picsum.photos/seed/juan/100/100',
    wallet: {
      totalEarnedAllTime: 15250.75, currentBalance: 1250.50,
      todayTotalRides: 5, todayTotalFareCollected: 350.00, todayTotalCommission: 70.00, todayNetEarnings: 280.00,
      paymentLogs: [{id: 'pay-1', date: new Date(Date.now() - 2*24*60*60*1000), amount: 1000, status: 'completed', method: 'GCash', referenceId: 'GCASH123'}],
      recentRides: [{id: 'ride-a', date: new Date(), pickupAddress: 'Admiral Village', dropoffAddress: 'SM Southmall', fare: 70, commissionDeducted: 14, netEarnings: 56}],
    }
  },
  { 
    id: 'trider-2', name: 'Maria Clara', 
    location: { latitude: 14.416700, longitude: 121.008200 }, 
    status: 'en-route', vehicleType: 'E-Bike', todaZoneId: '3', todaZoneName: 'ATODA',
    contactNumber: '+639177654321', profilePictureUrl: 'https://picsum.photos/seed/maria/100/100',
    wallet: {
      totalEarnedAllTime: 22500.00, currentBalance: 2500.75,
      todayTotalRides: 8, todayTotalFareCollected: 640.00, todayTotalCommission: 128.00, todayNetEarnings: 512.00,
      paymentLogs: [{id: 'pay-2', date: new Date(Date.now() - 5*24*60*60*1000), amount: 1500, status: 'completed', method: 'GCash', referenceId: 'GCASH456'}],
      recentRides: [{id: 'ride-b', date: new Date(), pickupAddress: 'Pilar Village', dropoffAddress: 'Festival Mall', fare: 80, commissionDeducted: 16, netEarnings: 64}],
    }
  },
  { 
    id: 'trider-3', name: 'Crisostomo Ibarra', 
    location: { latitude: 14.432500, longitude: 121.005000 }, 
    status: 'offline', vehicleType: 'Tricycle', todaZoneId: '5', todaZoneName: 'BFRSSCV',
    lastSeen: new Date(Date.now() - 3*60*60*1000), profilePictureUrl: 'https://picsum.photos/seed/crisostomo/100/100',
    wallet: {
      totalEarnedAllTime: 8700.25, currentBalance: 300.00,
      todayTotalRides: 0, todayTotalFareCollected: 0, todayTotalCommission: 0, todayNetEarnings: 0,
      paymentLogs: [], recentRides: [],
    }
  },
   { 
    id: 'trider-4', name: 'Sisa K.', 
    location: { latitude: 14.403000, longitude: 121.012000 }, 
    status: 'available', vehicleType: 'Tricycle', todaZoneId: '10', todaZoneName: 'MAMTTODA',
    contactNumber: '+639221112233', profilePictureUrl: 'https://picsum.photos/seed/sisa/100/100',
    wallet: {
      totalEarnedAllTime: 12340.50, currentBalance: 850.25,
      todayTotalRides: 3, todayTotalFareCollected: 280.00, todayTotalCommission: 56.00, todayNetEarnings: 224.00,
      paymentLogs: [{id: 'pay-3', date: new Date(Date.now() - 1*24*60*60*1000), amount: 500, status: 'completed', method: 'GCash', referenceId: 'GCASH789'}],
      recentRides: [{id: 'ride-c', date: new Date(Date.now() - 1*60*60*1000), pickupAddress: 'Moonwalk Village', dropoffAddress: 'City Hall', fare: 90, commissionDeducted: 18, netEarnings: 72}],
    }
  },
  { 
    id: 'trider-5', name: 'Elias P.', 
    location: { latitude: 14.447800, longitude: 120.977100 }, 
    status: 'suspended', vehicleType: 'Tricycle', todaZoneId: '13', todaZoneName: 'PVTODA',
    contactNumber: '+639334445566', profilePictureUrl: 'https://picsum.photos/seed/elias/100/100',
    wallet: {
      totalEarnedAllTime: 5200.00, currentBalance: 150.00,
      todayTotalRides: 0, todayTotalFareCollected: 0, todayTotalCommission: 0, todayNetEarnings: 0,
      paymentLogs: [],
      recentRides: [],
    }
  },
];


export default function TridersPage() {
  const [triders, setTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [filteredTriders, setFilteredTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [selectedTrider, setSelectedTrider] = React.useState<TriderProfile | null>(null);
  
  const [nameFilter, setNameFilter] = React.useState('');
  const [zoneFilter, setZoneFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [chatTargetTrider, setChatTargetTrider] = React.useState<TriderProfile | null>(null);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]); // Mock messages

  const { toast } = useToast();
  const todaZones = appTodaZones;

  React.useEffect(() => {
    let currentTriders = [...triders];
    if (nameFilter) {
      currentTriders = currentTriders.filter(t => t.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (zoneFilter !== 'all') {
      currentTriders = currentTriders.filter(t => t.todaZoneId === zoneFilter);
    }
    if (statusFilter !== 'all') {
      currentTriders = currentTriders.filter(t => t.status === statusFilter);
    }
    setFilteredTriders(currentTriders);
  }, [nameFilter, zoneFilter, statusFilter, triders]);

  // Simulate real-time location updates (simplified)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline' || trider.status === 'suspended') return trider;
          return {
            ...trider,
            location: {
              latitude: trider.location.latitude + (Math.random() - 0.5) * 0.0005,
              longitude: trider.location.longitude + (Math.random() - 0.5) * 0.0005,
            },
          };
        })
      );
    }, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);


  const handleSelectTrider = (trider: TriderProfile | null) => {
    setSelectedTrider(trider);
  };

  const handleOpenChat = (trider: TriderProfile) => {
    if (trider.status === 'offline' || trider.status === 'suspended') {
      toast({ title: "Cannot Chat", description: `${trider.name} is not online.`, variant: "destructive"});
      return;
    }
    setChatTargetTrider(trider);
    // Mock loading previous messages for this trider
    setChatMessages([
      { id: 'msg1', senderId: trider.id, receiverId: 'dispatcher', content: 'Hello, Dispatch! I am at my post.', timestamp: new Date(Date.now() - 5*60*1000)},
      { id: 'msg2', senderId: 'dispatcher', receiverId: trider.id, content: `Hi ${trider.name}, acknowledged. Stay safe!`, timestamp: new Date(Date.now() - 4*60*1000)},
    ]);
    setIsChatSheetOpen(true);
  };

  const handleSendChatMessage = (messageContent: string) => {
    if (!chatTargetTrider) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'dispatcher', // Assuming dispatcher is sending
      receiverId: chatTargetTrider.id,
      content: messageContent,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
    // Here you would typically send the message via Supabase Realtime
    toast({ title: "Message Sent", description: `To ${chatTargetTrider.name}: ${messageContent}`});
  };
  
  const handleTriderStatusChange = (triderId: string, newStatus: TriderExtendedStatus) => {
    setTriders(prev => prev.map(t => t.id === triderId ? {...t, status: newStatus} : t));
    setSelectedTrider(prev => prev && prev.id === triderId ? {...prev, status: newStatus} : prev);
    toast({ title: "Status Updated", description: `Trider status changed to ${newStatus}.`});
  };

  const handlePingTrider = (trider: TriderProfile) => {
    if (trider.status === 'offline' || trider.status === 'suspended') {
       toast({ title: "Cannot Ping", description: `${trider.name} is not online.`, variant: "destructive"});
       return;
    }
    // Mock ping functionality
    toast({ title: "Trider Pinged", description: `Notification sent to ${trider.name}.`});
  };

  const handleSendPayout = (trider: TriderProfile, amount: number) => {
     // Mock payout functionality
    toast({ title: "Payout Initiated", description: `₱${amount.toFixed(2)} payout to ${trider.name} is being processed.`});
    // Update wallet locally (mock)
    setTriders(prev => prev.map(t => t.id === trider.id ? {
      ...t, 
      wallet: {
        ...t.wallet, 
        currentBalance: t.wallet.currentBalance - amount,
        paymentLogs: [{ id: `pay-${Date.now()}`, date: new Date(), amount, status: 'pending', method: 'GCash', referenceId: `GCASHMOCK${Date.now()}`}, ...t.wallet.paymentLogs]
      }
    } : t));
     setSelectedTrider(prev => prev && prev.id === trider.id ? {
      ...prev,
      wallet: {
        ...prev.wallet, 
        currentBalance: prev.wallet.currentBalance - amount,
        paymentLogs: [{ id: `pay-${Date.now()}`, date: new Date(), amount, status: 'pending', method: 'GCash', referenceId: `GCASHMOCK${Date.now()}`}, ...prev.wallet.paymentLogs]
      }
    } : prev);
  };


  const statusOptions: { value: TriderExtendedStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'en-route', label: 'En Route' }, // Covers 'busy' and 'assigned'
    { value: 'offline', label: 'Offline' },
    { value: 'suspended', label: 'Suspended' },
  ];


  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Trider Management Dashboard</CardTitle>
          <CardDescription>Monitor, manage, and communicate with your triders.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by Trider name..." 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by TODA Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TODA Zones</SelectItem>
              {todaZones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>{zone.name} ({zone.areaOfOperation})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden">
        <div className="lg:col-span-2 h-full overflow-y-auto">
           <TridersTable 
             triders={filteredTriders}
             selectedTriderId={selectedTrider?.id || null}
             onSelectTrider={handleSelectTrider}
             onOpenChat={handleOpenChat}
           />
        </div>
        <div className="lg:col-span-1 h-full overflow-y-auto">
          {selectedTrider ? (
            <TriderDetailPanel 
              trider={selectedTrider} 
              onClose={() => setSelectedTrider(null)}
              onStatusChange={handleTriderStatusChange}
              onPingTrider={handlePingTrider}
              onSendPayout={handleSendPayout}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a trider to view details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {chatTargetTrider && (
        <TriderChatSheet
          isOpen={isChatSheetOpen}
          onOpenChange={setIsChatSheetOpen}
          trider={chatTargetTrider}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
        />
      )}
    </div>
  );
}
