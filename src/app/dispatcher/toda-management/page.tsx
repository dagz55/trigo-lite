
      "use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Edit, X, Search, Save, Users, Bike, ShieldAlert, MapPin } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones';
import type { TodaZone, Coordinates } from '@/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const getMockTriderCounts = (zoneId: string) => {
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    activeRides: Math.floor(hash % 3),
    availableTriders: Math.floor(hash % 5) + 2,
    offlineTriders: Math.floor(hash % 4),
  };
};

export default function TodaManagementPage() {
  const { 
    defaultBaseFare,
    perKmCharge,
    convenienceFee,
    todaBaseFares,
    todaTerminalExitPoints,
    updateSetting,
    isLoading: settingsLoading,
    getTodaBaseFare,
    getTodaTerminalExitPoint
  } = useSettings();
  
  const { toast } = useToast();

  const [localDefaultBaseFare, setLocalDefaultBaseFare] = React.useState<string>('');
  const [localPerKmCharge, setLocalPerKmCharge] = React.useState<string>('');
  const [localConvenienceFee, setLocalConvenienceFee] = React.useState<string>('');
  const [localTodaBaseFares, setLocalTodaBaseFares] = React.useState<Record<string, string>>({});
  const [localTodaTerminalExitPoints, setLocalTodaTerminalExitPoints] = React.useState<Record<string, {point: Coordinates | null, address: string }>>({});

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedZoneForModal, setSelectedZoneForModal] = React.useState<TodaZone | null>(null);
  const [editingFareInModal, setEditingFareInModal] = React.useState<string>('');
  const [editingTerminalLat, setEditingTerminalLat] = React.useState<string>('');
  const [editingTerminalLng, setEditingTerminalLng] = React.useState<string>('');
  const [editingTerminalAddress, setEditingTerminalAddress] = React.useState<string>('');

  React.useEffect(() => {
    if (!settingsLoading) {
      setLocalDefaultBaseFare(defaultBaseFare.toString());
      setLocalPerKmCharge(perKmCharge.toString());
      setLocalConvenienceFee(convenienceFee.toString());
      const initialLocalTodaFares: Record<string, string> = {};
      const initialLocalTerminalExitPoints: Record<string, {point: Coordinates | null, address: string }> = {};

      appTodaZones.forEach(zone => {
        initialLocalTodaFares[zone.id] = getTodaBaseFare(zone.id).toString();
        const terminal = getTodaTerminalExitPoint(zone.id);
        initialLocalTerminalExitPoints[zone.id] = {
          point: terminal?.point || null,
          address: terminal?.address || '',
        };
      });
      setLocalTodaBaseFares(initialLocalTodaFares);
      setLocalTodaTerminalExitPoints(initialLocalTerminalExitPoints);
    }
  }, [settingsLoading, defaultBaseFare, perKmCharge, convenienceFee, todaBaseFares, todaTerminalExitPoints, getTodaBaseFare, getTodaTerminalExitPoint]);

  const handleSaveAllSettings = () => {
    // ... (validation for global fares remains the same)
    const newDefaultBaseFare = parseFloat(localDefaultBaseFare);
    const newPerKmCharge = parseFloat(localPerKmCharge);
    const newConvenienceFee = parseFloat(localConvenienceFee);

    if (isNaN(newDefaultBaseFare) || newDefaultBaseFare < 0) { /* ... */ return; }
    if (isNaN(newPerKmCharge) || newPerKmCharge < 0) { /* ... */ return; }
    if (isNaN(newConvenienceFee) || newConvenienceFee < 0) { /* ... */ return; }

    const updatedTodaSpecificFares: Record<string, number> = {};
    // ... (validation for specific TODA fares remains the same)
     for (const zoneId in localTodaBaseFares) {
      const fareVal = parseFloat(localTodaBaseFares[zoneId]);
      if (isNaN(fareVal) || fareVal < 0) {
        toast({ title: "Invalid TODA Base Fare", description: `Base fare for ${appTodaZones.find(z => z.id === zoneId)?.name} must be a non-negative number.`, variant: "destructive" });
        return;
      }
      updatedTodaSpecificFares[zoneId] = fareVal;
    }

    const finalTodaTerminalExitPoints: Record<string, { point: Coordinates; address: string } | undefined> = {};
    for (const zoneId in localTodaTerminalExitPoints) {
      const { point, address } = localTodaTerminalExitPoints[zoneId];
      if (point && (point.latitude !== null && point.longitude !== null) && address.trim() !== '') {
        finalTodaTerminalExitPoints[zoneId] = { point, address };
      } else if ((point && (point.latitude !== null || point.longitude !== null)) || address.trim() !== '') {
         // If only some parts are filled, consider it invalid or prompt user
         toast({ title: "Incomplete Terminal Info", description: `Please provide both coordinates and address for ${appTodaZones.find(z => z.id === zoneId)?.name}'s terminal, or clear all fields.`, variant: "destructive" });
         return;
      }
    }


    updateSetting('defaultBaseFare', newDefaultBaseFare);
    updateSetting('perKmCharge', newPerKmCharge);
    updateSetting('convenienceFee', newConvenienceFee);
    updateSetting('todaBaseFares', updatedTodaSpecificFares);
    updateSetting('todaTerminalExitPoints', finalTodaTerminalExitPoints);
    
    toast({ title: "TODA Settings Saved", description: "Fare matrix and terminal points have been updated." });
  };

  const openZoneModal = (zone: TodaZone) => {
    setSelectedZoneForModal(zone);
    setEditingFareInModal(localTodaBaseFares[zone.id] || getTodaBaseFare(zone.id).toString());
    const terminal = localTodaTerminalExitPoints[zone.id] || getTodaTerminalExitPoint(zone.id);
    setEditingTerminalLat(terminal?.point?.latitude?.toString() || '');
    setEditingTerminalLng(terminal?.point?.longitude?.toString() || '');
    setEditingTerminalAddress(terminal?.address || '');
    setIsModalOpen(true);
  };

  const handleSaveModalChanges = () => {
    if (selectedZoneForModal) {
      const newFare = parseFloat(editingFareInModal);
      if (isNaN(newFare) || newFare < 0) {
        toast({ title: "Invalid Base Fare", description: "Base fare must be a non-negative number.", variant: "destructive" });
        return;
      }
      
      const lat = parseFloat(editingTerminalLat);
      const lng = parseFloat(editingTerminalLng);
      let terminalPoint: Coordinates | null = null;

      if (editingTerminalLat.trim() !== '' || editingTerminalLng.trim() !== '' || editingTerminalAddress.trim() !== '') {
        if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180 || editingTerminalAddress.trim() === '') {
          toast({ title: "Invalid Terminal Info", description: "Provide valid Latitude (-90 to 90), Longitude (-180 to 180), and Address, or clear all terminal fields.", variant: "destructive" });
          return;
        }
        terminalPoint = { latitude: lat, longitude: lng };
      }

      setLocalTodaBaseFares(prev => ({
        ...prev,
        [selectedZoneForModal.id]: newFare.toString()
      }));
      setLocalTodaTerminalExitPoints(prev => ({
        ...prev,
        [selectedZoneForModal.id]: { point: terminalPoint, address: editingTerminalAddress.trim() }
      }));

      toast({ title: "TODA Settings Updated (Locally)", description: `Settings for ${selectedZoneForModal.name} updated. Save all changes to persist.` });
      setIsModalOpen(false);
    }
  };


  const filteredZones = appTodaZones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.areaOfOperation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading TODA Management...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">TODA Zones & Fare Management</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/> Global Fare Matrix Configuration</CardTitle>
            <CardDescription>Set the default fare structure for all TODAs. Specific TODAs can have their base fares and terminal points overridden below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="default-base-fare">Default Base Fare (PHP)</Label>
                <Input id="default-base-fare" type="number" value={localDefaultBaseFare} onChange={e => setLocalDefaultBaseFare(e.target.value)} min="0" step="0.01" />
              </div>
              <div>
                <Label htmlFor="per-km-charge">Per KM Charge (PHP)</Label>
                <Input id="per-km-charge" type="number" value={localPerKmCharge} onChange={e => setLocalPerKmCharge(e.target.value)} min="0" step="0.01" />
              </div>
              <div>
                <Label htmlFor="convenience-fee">Convenience Fee (PHP)</Label>
                <Input id="convenience-fee" type="number" value={localConvenienceFee} onChange={e => setLocalConvenienceFee(e.target.value)} min="0" step="0.01" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center"><Edit className="mr-2 h-5 w-5 text-primary"/> TODA-Specific Settings</CardTitle>
              <div className="relative">
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="text" 
                  className="pl-8 py-2 pr-3 h-9"
                  placeholder="Search zones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>Click on a TODA zone to override its default base fare and set its terminal exit point.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredZones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map(zone => {
                  const counts = getMockTriderCounts(zone.id);
                  const currentFare = parseFloat(localTodaBaseFares[zone.id] || getTodaBaseFare(zone.id).toString()).toFixed(2);
                  const terminalInfo = localTodaTerminalExitPoints[zone.id] || getTodaTerminalExitPoint(zone.id);
                  return (
                    <Dialog key={zone.id} open={isModalOpen && selectedZoneForModal?.id === zone.id} onOpenChange={(open) => {
                      if (!open) {
                        setIsModalOpen(false);
                        setSelectedZoneForModal(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Card 
                          onClick={() => openZoneModal(zone)}
                          className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md">{zone.name}</CardTitle>
                            <CardDescription className="text-xs">{zone.areaOfOperation}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1 flex-grow">
                            <p>Base Fare: <span className="font-semibold text-primary">₱{currentFare}</span></p>
                            {terminalInfo?.address && (
                               <p className="text-xs text-muted-foreground flex items-center mt-1">
                                <MapPin size={12} className="mr-1 text-blue-500"/> Terminal: {terminalInfo.address}
                               </p>
                            )}
                            <div className="text-xs text-muted-foreground pt-1">
                              <p className="flex items-center"><ShieldAlert className="mr-1.5 h-3 w-3 text-red-500" /> Active Rides: {counts.activeRides}</p>
                              <p className="flex items-center"><Bike className="mr-1.5 h-3 w-3 text-green-500" /> Available: {counts.availableTriders}</p>
                              <p className="flex items-center"><Users className="mr-1.5 h-3 w-3 text-gray-500" /> Offline: {counts.offlineTriders}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                       {selectedZoneForModal?.id === zone.id && (
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Settings: {selectedZoneForModal.name}</DialogTitle>
                            <DialogDescription>{selectedZoneForModal.areaOfOperation}</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh] p-1">
                            <div className="py-4 space-y-4 pr-4">
                              <div>
                                <Label htmlFor={`fare-modal-${selectedZoneForModal.id}`}>Base Fare (PHP)</Label>
                                <Input id={`fare-modal-${selectedZoneForModal.id}`} type="number" value={editingFareInModal} onChange={e => setEditingFareInModal(e.target.value)} min="0" step="0.01" className="mt-1"/>
                              </div>
                              <Separator />
                              <div>
                                <h4 className="font-medium text-sm mb-2">Terminal Exit Point</h4>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <Label htmlFor={`terminal-lat-${selectedZoneForModal.id}`}>Latitude</Label>
                                    <Input id={`terminal-lat-${selectedZoneForModal.id}`} type="number" placeholder="e.g. 14.4445" value={editingTerminalLat} onChange={e => setEditingTerminalLat(e.target.value)} className="mt-1"/>
                                  </div>
                                  <div>
                                    <Label htmlFor={`terminal-lng-${selectedZoneForModal.id}`}>Longitude</Label>
                                    <Input id={`terminal-lng-${selectedZoneForModal.id}`} type="number" placeholder="e.g. 120.9938" value={editingTerminalLng} onChange={e => setEditingTerminalLng(e.target.value)} className="mt-1"/>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`terminal-address-${selectedZoneForModal.id}`}>Terminal Address</Label>
                                  <Input id={`terminal-address-${selectedZoneForModal.id}`} type="text" placeholder="e.g. Main St. Terminal" value={editingTerminalAddress} onChange={e => setEditingTerminalAddress(e.target.value)} className="mt-1"/>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Leave all terminal fields blank to unset.</p>
                              </div>
                              <Separator />
                               <div>
                                  <h4 className="font-medium text-sm mb-1">Trider Status (Mocked)</h4>
                                  <p className="text-xs text-muted-foreground flex items-center"><ShieldAlert className="mr-1.5 h-3 w-3 text-red-500" /> Active Rides: {getMockTriderCounts(selectedZoneForModal.id).activeRides}</p>
                                  <p className="text-xs text-muted-foreground flex items-center"><Bike className="mr-1.5 h-3 w-3 text-green-500" /> Available Triders: {getMockTriderCounts(selectedZoneForModal.id).availableTriders}</p>
                                  <p className="text-xs text-muted-foreground flex items-center"><Users className="mr-1.5 h-3 w-3 text-gray-500" /> Offline Triders: {getMockTriderCounts(selectedZoneForModal.id).offlineTriders}</p>
                              </div>
                              <Separator />
                              <div>
                                <Label htmlFor="special-conditions">Special Conditions (UI Only)</Label>
                                <Select defaultValue="none">
                                  <SelectTrigger id="special-conditions" className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="peak">Peak hours surcharge</SelectItem>
                                    <SelectItem value="event">Special event rate</SelectItem>
                                    <SelectItem value="weekend">Weekend rate</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">This setting is for UI demonstration and is not currently saved.</p>
                              </div>
                              <div>
                                <Label htmlFor="additional-notes">Additional Notes (UI Only)</Label>
                                <Textarea id="additional-notes" className="mt-1 resize-none h-20" placeholder="Any special instructions or rules for this TODA..."/>
                                 <p className="text-xs text-muted-foreground mt-1">This setting is for UI demonstration and is not currently saved.</p>
                              </div>
                            </div>
                          </ScrollArea>
                          <DialogFooter className="pt-4 border-t">
                            <DialogClose asChild>
                               <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSaveModalChanges}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No TODA zones found matching your search.</p>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveAllSettings}>
             <Save size={16} className="mr-2" />
            Save All TODA Settings
          </Button>
        </div>

        <Separator />

        <Card>
          <CardHeader><CardTitle>Manage TODA Zones</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to Add, Modify, or Delete TODA zones (including their names, operational areas, map boundaries) will be implemented here. 
              This requires database integration. For now, TODA zones are managed in `src/data/todaZones.ts`.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Manage Triders within TODAs</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to assign triders to specific TODAs, remove them, or modify their details within a TODA context will be implemented here.
              This requires database integration. Trider profiles and their TODA assignments are currently managed in `src/app/dispatcher/triders/page.tsx` and related files.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Manage Demo Passenger Profiles</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to Add, Modify, or Delete demo passenger profiles for testing scenarios will be implemented here.
              This requires database integration. Demo passenger profiles are currently managed in `src/data/mockPassengerProfiles.ts`.
            </p>
          </CardContent>
        </Card>

      </div>
    </ScrollArea>
  );
}
    
