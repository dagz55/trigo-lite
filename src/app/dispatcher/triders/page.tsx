
"use client";

import * as React from 'react';
import type { TriderProfile, ChatMessage, TriderExtendedStatus, TodaZoneChangeRequestStatus } from '@/types';
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
import { getRandomPointInCircle } from '@/lib/geoUtils'; 

const TALON_KUATRO_ZONE_ID = '2'; // ID for "APHDA" (Talon Kuatro)
const TEPTODA_ZONE_ID = '7'; // ID for "TEPTODA" (Talon Equitable)

const talonKuatroZone = appTodaZones.find(z => z.id === TALON_KUATRO_ZONE_ID);
const teptodaZone = appTodaZones.find(z => z.id === TEPTODA_ZONE_ID);

if (!talonKuatroZone) throw new Error(`Talon Kuatro zone with ID ${TALON_KUATRO_ZONE_ID} not found.`);
if (!teptodaZone) throw new Error(`TEPTODA zone with ID ${TEPTODA_ZONE_ID} not found.`);

const initialTalonKuatroTriders: TriderProfile[] = [
  "Peter", "Andrew", "James Z.", "John", "Philip" 
].map((name, index) => {
  const randomLocationInZone = getRandomPointInCircle(talonKuatroZone!.center, talonKuatroZone!.radiusKm * 0.8);
  const statuses: TriderExtendedStatus[] = ['available', 'en-route', 'offline', 'suspended', 'assigned'];
  const status = statuses[index % statuses.length];

  return {
    id: `trider-tk-profile-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'Tricycle' : 'E-Bike',
    todaZoneId: TALON_KUATRO_ZONE_ID,
    todaZoneName: talonKuatroZone!.name,
    contactNumber: `+63917${2000000 + index * 12345}`.slice(0,13),
    profilePictureUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
    dataAiHint: "driver person",
    lastSeen: status === 'offline' ? new Date(Date.now() - (index + 1) * 60 * 60 * 1000) : undefined,
    wallet: {
      totalEarnedAllTime: parseFloat((Math.random() * 15000 + 3000).toFixed(2)),
      currentBalance: parseFloat((Math.random() * 2000 + 100).toFixed(2)),
      todayTotalRides: status === 'offline' || status === 'suspended' ? 0 : Math.floor(Math.random() * 8),
      todayTotalFareCollected: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 400 + 40)).toFixed(2)),
      todayTotalCommission: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 80 + 8)).toFixed(2)),
      todayNetEarnings: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 320 + 32)).toFixed(2)),
      paymentLogs: status === 'available' || status === 'en-route' ? [{id: `pay-tk-${index}`, date: new Date(Date.now() - (index+1)*24*60*60*1000), amount: parseFloat((Math.random()*400+400).toFixed(2)), status: 'completed', method: 'GCash', referenceId: `GCASHTK${index}`}] : [],
      recentRides: status === 'available' || status === 'en-route' ? [{id: `ride-tk-${index}`, date: new Date(Date.now() - index*30*60*1000), pickupAddress: `${talonKuatroZone!.areaOfOperation} Area`, dropoffAddress: `Nearby Dropoff TK ${index}`, fare: parseFloat((Math.random()*40+40).toFixed(2)), commissionDeducted: parseFloat((Math.random()*8+8).toFixed(2)), netEarnings: parseFloat((Math.random()*32+32).toFixed(2))}] : [],
    },
    currentPath: null,
    pathIndex: 0,
    requestedTodaZoneId: undefined,
    todaZoneChangeRequestStatus: 'none',
  };
});

const initialTeptodaTriders: TriderProfile[] = [
  "Bartholomew", "Thomas", "Matthew", "James A.", "Thaddaeus"
].map((name, index) => {
  const randomLocationInZone = getRandomPointInCircle(teptodaZone!.center, teptodaZone!.radiusKm * 0.8);
  const statuses: TriderExtendedStatus[] = ['available', 'offline', 'en-route', 'assigned', 'suspended']; // Different status distribution
  const status = statuses[index % statuses.length];

  return {
    id: `trider-tep-profile-${index + 1}`,
    name: `${name} (TEP)`,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'E-Bike' : 'Tricycle',
    todaZoneId: TEPTODA_ZONE_ID,
    todaZoneName: teptodaZone!.name,
    contactNumber: `+63920${3000000 + index * 54321}`.slice(0,13),
    profilePictureUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}P`,
    dataAiHint: "driver philippines",
    lastSeen: status === 'offline' ? new Date(Date.now() - (index + 2) * 45 * 60 * 1000) : undefined,
    wallet: {
      totalEarnedAllTime: parseFloat((Math.random() * 18000 + 4000).toFixed(2)),
      currentBalance: parseFloat((Math.random() * 2500 + 150).toFixed(2)),
      todayTotalRides: status === 'offline' || status === 'suspended' ? 0 : Math.floor(Math.random() * 7),
      todayTotalFareCollected: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 350 + 30)).toFixed(2)),
      todayTotalCommission: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 70 + 7)).toFixed(2)),
      todayNetEarnings: parseFloat((status === 'offline' || status === 'suspended' ? 0 : (Math.random() * 280 + 28)).toFixed(2)),
      paymentLogs: status === 'available' || status === 'en-route' ? [{id: `pay-tep-${index}`, date: new Date(Date.now() - (index+2)*24*60*60*1000), amount: parseFloat((Math.random()*300+300).toFixed(2)), status: 'completed', method: 'GCash', referenceId: `GCASHTEP${index}`}] : [],
      recentRides: status === 'available' || status === 'en-route' ? [{id: `ride-tep-${index}`, date: new Date(Date.now() - index*40*60*1000), pickupAddress: `${teptodaZone!.areaOfOperation} St.`, dropoffAddress: `Nearby Address ${index+5}`, fare: parseFloat((Math.random()*35+35).toFixed(2)), commissionDeducted: parseFloat((Math.random()*7+7).toFixed(2)), netEarnings: parseFloat((Math.random()*28+28).toFixed(2))}] : [],
    },
    currentPath: null,
    pathIndex: 0,
    requestedTodaZoneId: undefined,
    todaZoneChangeRequestStatus: 'none',
  };
});


const initialTridersProfiles: TriderProfile[] = [...initialTalonKuatroTriders, ...initialTeptodaTriders];


export default function TridersPage() {
  const [triders, setTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [filteredTriders, setFilteredTriders] = React.useState<TriderProfile[]>(initialTridersProfiles);
  const [selectedTrider, setSelectedTrider] = React.useState<TriderProfile | null>(null);
  
  const [nameFilter, setNameFilter] = React.useState('');
  const [zoneFilter, setZoneFilter] = React.useState<string>('all'); 
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [isChatSheetOpen, setIsChatSheetOpen] = React.useState(false);
  const [chatTargetTrider, setChatTargetTrider] = React.useState<TriderProfile | null>(null);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]); 

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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline' || trider.status === 'suspended') return trider;
          
          let newLocation = { ...trider.location };
          if (trider.currentPath && trider.currentPath.coordinates.length > 0 && (trider.status === 'en-route' || trider.status === 'assigned' || trider.status === 'busy')) {
            let nextIndex = trider.pathIndex + 1;
            if (nextIndex < trider.currentPath.coordinates.length) {
              newLocation = { 
                longitude: trider.currentPath.coordinates[nextIndex][0], 
                latitude: trider.currentPath.coordinates[nextIndex][1] 
              };
              return { ...trider, location: newLocation, pathIndex: nextIndex };
            } else { 
              newLocation = { 
                longitude: trider.currentPath.coordinates[trider.currentPath.coordinates.length -1][0], 
                latitude: trider.currentPath.coordinates[trider.currentPath.coordinates.length -1][1] 
              };
              // If it arrived, clear path. Dispatcher doesn't auto-set to available.
              return { ...trider, location: newLocation, currentPath: null, pathIndex: 0 }; 
            }
          } else {
            const currentZone = appTodaZones.find(z => z.id === trider.todaZoneId);
            newLocation = currentZone 
              ? getRandomPointInCircle(currentZone.center, currentZone.radiusKm * 0.8) 
              : { 
                  latitude: trider.location.latitude + (Math.random() - 0.5) * 0.0005,
                  longitude: trider.location.longitude + (Math.random() - 0.5) * 0.0005,
                };
            return { ...trider, location: newLocation };
          }
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
    setChatMessages([
      { id: 'msg1', senderId: trider.id, receiverId: 'dispatcher', content: `Hello, Dispatch! Reporting from ${trider.todaZoneName}.`, timestamp: new Date(Date.now() - 5*60*1000)},
      { id: 'msg2', senderId: 'dispatcher', receiverId: trider.id, content: `Hi ${trider.name}, acknowledged. Stay safe in ${trider.todaZoneName}!`, timestamp: new Date(Date.now() - 4*60*1000)},
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
    setChatMessages(prev => [...prev, newMessage]);
    toast({ title: "Message Sent (Mock)", description: `To ${chatTargetTrider.name}: ${messageContent}`});
  };
  
  const handleTriderStatusChange = (triderId: string, newStatus: TriderExtendedStatus) => {
    setTriders(prev => prev.map(t => t.id === triderId ? {...t, status: newStatus, ...(newStatus === 'offline' && { lastSeen: new Date() }), currentPath: null, pathIndex: 0 } : t));
    setSelectedTrider(prev => prev && prev.id === triderId ? {...prev, status: newStatus, ...(newStatus === 'offline' && { lastSeen: new Date() }), currentPath: null, pathIndex: 0 } : prev);
    toast({ title: "Status Updated (Mock)", description: `Trider status changed to ${newStatus}.`});
  };

  const handlePingTrider = (trider: TriderProfile) => {
    if (trider.status === 'offline' || trider.status === 'suspended') {
       toast({ title: "Cannot Ping", description: `${trider.name} is not online.`, variant: "destructive"});
       return;
    }
    toast({ title: "Trider Pinged (Mock)", description: `Notification sent to ${trider.name}.`});
  };

  const handleSendPayout = (trider: TriderProfile, amount: number) => {
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

  const handleTodaZoneChangeRequest = (triderId: string, action: 'approve' | 'reject') => {
    setTriders(prevTriders => prevTriders.map(t => {
      if (t.id === triderId && t.requestedTodaZoneId && t.todaZoneChangeRequestStatus === 'pending') {
        if (action === 'approve') {
          const newZone = appTodaZones.find(z => z.id === t.requestedTodaZoneId);
          toast({ title: "Zone Change Approved", description: `${t.name} moved to ${newZone?.name || 'new zone'}. Location randomized.` });
          return {
            ...t,
            todaZoneId: t.requestedTodaZoneId,
            todaZoneName: newZone?.name || 'Unknown Zone',
            location: newZone ? getRandomPointInCircle(newZone.center, newZone.radiusKm * 0.8) : t.location, // Randomize location in new zone
            requestedTodaZoneId: undefined,
            todaZoneChangeRequestStatus: 'none', 
          };
        } else { // reject
          toast({ title: "Zone Change Rejected", description: `Request for ${t.name} to move was rejected.` });
          return {
            ...t,
            requestedTodaZoneId: undefined,
            todaZoneChangeRequestStatus: 'none', 
          };
        }
      }
      return t;
    }));
    setSelectedTrider(prev => {
      if (prev && prev.id === triderId && prev.requestedTodaZoneId && prev.todaZoneChangeRequestStatus === 'pending') {
        if (action === 'approve') {
          const newZone = appTodaZones.find(z => z.id === prev.requestedTodaZoneId);
          return {
            ...prev,
            todaZoneId: prev.requestedTodaZoneId,
            todaZoneName: newZone?.name || 'Unknown Zone',
            location: newZone ? getRandomPointInCircle(newZone.center, newZone.radiusKm * 0.8) : prev.location,
            requestedTodaZoneId: undefined,
            todaZoneChangeRequestStatus: 'none',
          };
        } else {
          return {
            ...prev,
            requestedTodaZoneId: undefined,
            todaZoneChangeRequestStatus: 'none',
          };
        }
      }
      return prev;
    });
  };


  const statusOptions: { value: TriderExtendedStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'en-route', label: 'En Route' },
    { value: 'offline', label: 'Offline' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'assigned', label: 'Assigned'},
    { value: 'busy', label: 'Busy'} 
  ];


  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Trider Management Dashboard</CardTitle>
          <CardDescription>Monitor, manage, and communicate with your triders. Data is currently mocked.</CardDescription>
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
             todaZones={appTodaZones}
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
              onTodaZoneChangeRequest={handleTodaZoneChangeRequest}
              allTodaZones={appTodaZones}
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
