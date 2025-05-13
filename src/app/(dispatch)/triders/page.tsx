
"use client";

import * as React from 'react';
import type { TriderProfile, ChatMessage, TriderExtendedStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TridersTable } from '@/components/triders/TridersTable';
import { TriderDetailPanel } from '@/components/triders/TriderDetailPanel';
import { TriderChatSheet } from '@/components/triders/TriderChatSheet';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Search } from 'lucide-react';
import { getRandomPointInCircle } from '@/lib/geoUtils'; // For random locations

// TODO: Replace mock data with Supabase fetching.
// Example: const { data: triders, error } = await supabase.from('triders').select('*');

const apostleNames = [
  "Peter", "Andrew", "James Z.", "John", "Philip", "Bartholomew", 
  "Thomas", "Matthew", "James A.", "Thaddaeus", "Simon Z.", "Matthias"
];

const initialTridersProfiles: TriderProfile[] = apostleNames.map((name, index) => {
  const todaZoneIndex = index % appTodaZones.length;
  const todaZone = appTodaZones[todaZoneIndex];
  const randomLocationInZone = getRandomPointInCircle(todaZone.center, todaZone.radiusKm * 0.8);
  
  // Alternate statuses for variety
  const statuses: TriderExtendedStatus[] = ['available', 'en-route', 'offline', 'suspended'];
  const status = statuses[index % statuses.length];

  return {
    id: `trider-apostle-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'Tricycle' : 'E-Bike',
    todaZoneId: todaZone.id,
    todaZoneName: todaZone.name,
    contactNumber: `+63917${1000000 + index * 12345}`.slice(0,13),
    profilePictureUrl: `https://picsum.photos/seed/${name.toLowerCase().replace(/\s/g, '')}/100/100`,
    lastSeen: status === 'offline' ? new Date(Date.now() - (index + 1) * 60 * 60 * 1000) : undefined,
    wallet: {
      totalEarnedAllTime: (Math.random() * 20000 + 5000),
      currentBalance: (Math.random() * 3000 + 200),
      todayTotalRides: status === 'offline' || status === 'suspended' ? 0 : Math.floor(Math.random() * 10),
      todayTotalFareCollected: status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 500 + 50),
      todayTotalCommission: status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 100 + 10),
      todayNetEarnings: status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 400 + 40),
      paymentLogs: status === 'available' || status === 'en-route' ? [{id: `pay-${index}`, date: new Date(Date.now() - (index+1)*24*60*60*1000), amount: (Math.random()*500+500), status: 'completed', method: 'GCash', referenceId: `GCASHAPOSTLE${index}`}] : [],
      recentRides: status === 'available' || status === 'en-route' ? [{id: `ride-apostle-${index}`, date: new Date(Date.now() - index*30*60*1000), pickupAddress: `${todaZone.areaOfOperation} Pickup`, dropoffAddress: `Nearby Dropoff ${index}`, fare: (Math.random()*50+50), commissionDeducted: (Math.random()*10+10), netEarnings: (Math.random()*40+40)}] : [],
    }
  };
});


export default function TridersPage() {
  // TODO: Replace useState with data fetching from Supabase (e.g., React Query or SWR)
  const [triders, setTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [filteredTriders, setFilteredTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [selectedTrider, setSelectedTrider] = React.useState<TriderProfile | null>(null);
  
  const [nameFilter, setNameFilter] = React.useState('');
  const [zoneFilter, setZoneFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [chatTargetTrider, setChatTargetTrider] = React.useState<TriderProfile | null>(null);
  // TODO: Fetch chat messages from Supabase for the selected trider
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]); 

  const { toast } = useToast();
  const todaZones = appTodaZones;

  React.useEffect(() => {
    // This filtering logic would ideally be part of the Supabase query
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
  // TODO: In a real app, this would come from Supabase Realtime or periodic fetches for trider locations
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline' || trider.status === 'suspended') return trider;
          const currentZone = appTodaZones.find(z => z.id === trider.todaZoneId);
          const newLocation = currentZone 
            ? getRandomPointInCircle(currentZone.center, currentZone.radiusKm * 0.8) 
            : { 
                latitude: trider.location.latitude + (Math.random() - 0.5) * 0.0005,
                longitude: trider.location.longitude + (Math.random() - 0.5) * 0.0005,
              };
          return { ...trider, location: newLocation };
        })
      );
    }, 10000); 
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
    // TODO: Fetch actual chat messages from Supabase for this trider & dispatcher
    // Example: const { data, error } = await supabase.from('ride_chat_messages').select('*').or(`sender_id.eq.${trider.id},receiver_id.eq.${trider.id}`).order('timestamp');
    setChatMessages([
      { id: 'msg1', senderId: trider.id, receiverId: 'dispatcher', content: 'Hello, Dispatch! Reporting for duty.', timestamp: new Date(Date.now() - 5*60*1000)},
      { id: 'msg2', senderId: 'dispatcher', receiverId: trider.id, content: `Hi ${trider.name}, acknowledged. Have a good shift!`, timestamp: new Date(Date.now() - 4*60*1000)},
    ]);
    setIsChatSheetOpen(true);
  };

  const handleSendChatMessage = (messageContent: string) => {
    if (!chatTargetTrider) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'dispatcher', 
      receiverId: chatTargetTrider.id,
      content: messageContent,
      timestamp: new Date(),
    };
    // TODO: Insert new message into Supabase `ride_chat_messages` table
    // Example: await supabase.from('ride_chat_messages').insert(newMessage);
    setChatMessages(prev => [...prev, newMessage]);
    toast({ title: "Message Sent (Mock)", description: `To ${chatTargetTrider.name}: ${messageContent}`});
  };
  
  const handleTriderStatusChange = (triderId: string, newStatus: TriderExtendedStatus) => {
    // TODO: Update trider status in Supabase
    // Example: await supabase.from('triders').update({ status: newStatus, updated_at: new Date() }).eq('id', triderId);
    setTriders(prev => prev.map(t => t.id === triderId ? {...t, status: newStatus, ...(newStatus === 'offline' && { lastSeen: new Date() })} : t));
    setSelectedTrider(prev => prev && prev.id === triderId ? {...prev, status: newStatus, ...(newStatus === 'offline' && { lastSeen: new Date() })} : prev);
    toast({ title: "Status Updated (Mock)", description: `Trider status changed to ${newStatus}.`});
  };

  const handlePingTrider = (trider: TriderProfile) => {
    if (trider.status === 'offline' || trider.status === 'suspended') {
       toast({ title: "Cannot Ping", description: `${trider.name} is not online.`, variant: "destructive"});
       return;
    }
    // TODO: Implement actual ping functionality (e.g., Supabase Realtime notification or push notification)
    toast({ title: "Trider Pinged (Mock)", description: `Notification sent to ${trider.name}.`});
  };

  const handleSendPayout = (trider: TriderProfile, amount: number) => {
    // TODO: Integrate with actual payout service (e.g., GCash API) and record in Supabase
    // Example: await supabase.from('payment_logs').insert({ trider_id: trider.id, amount, status: 'pending', method: 'GCash' });
    toast({ title: "Payout Initiated (Mock)", description: `₱${amount.toFixed(2)} payout to ${trider.name} is being processed.`});
    
    setTriders(prev => prev.map(t => t.id === trider.id ? {
      ...t, 
      wallet: {
        ...t.wallet, 
        currentBalance: t.wallet.currentBalance - amount,
        paymentLogs: [{ id: `pay-mock-${Date.now()}`, date: new Date(), amount, status: 'pending', method: 'GCash (Mock)', referenceId: `MOCKPAY${Date.now()}`}, ...t.wallet.paymentLogs]
      }
    } : t));
     setSelectedTrider(prev => prev && prev.id === trider.id ? {
      ...prev,
      wallet: {
        ...prev.wallet, 
        currentBalance: prev.wallet.currentBalance - amount,
        paymentLogs: [{ id: `pay-mock-${Date.now()}`, date: new Date(), amount, status: 'pending', method: 'GCash (Mock)', referenceId: `MOCKPAY${Date.now()}`}, ...prev.wallet.paymentLogs]
      }
    } : prev);
  };


  const statusOptions: { value: TriderExtendedStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'en-route', label: 'En Route' },
    { value: 'offline', label: 'Offline' },
    { value: 'suspended', label: 'Suspended' },
    // 'assigned' and 'busy' can be covered by 'en-route' for filtering simplicity, or added if more granularity is needed.
  ];


  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Trider Management Dashboard</CardTitle>
          <CardDescription>Monitor, manage, and communicate with your triders. Data is currently mocked. {/* TODO: Remove "Data is currently mocked." when Supabase is live */}</CardDescription>
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
