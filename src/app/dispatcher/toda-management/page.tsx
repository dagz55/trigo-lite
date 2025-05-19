
      "use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Edit, X, Search, Save, Users, Bike, ShieldAlert } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones';
import type { TodaZone } from '@/types';
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

// Mock function to get trider counts for a zone (replace with actual data logic later)
const getMockTriderCounts = (zoneId: string) => {
  // In a real app, this would query trider data filtered by zoneId
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    activeRides: Math.floor(hash % 3), // Mocked
    availableTriders: Math.floor(hash % 5) + 2, // Mocked
    offlineTriders: Math.floor(hash % 4), // Mocked
  };
};

export default function TodaManagementPage() {
  const { 
    defaultBaseFare,
    perKmCharge,
    convenienceFee,
    todaBaseFares,
    updateSetting,
    isLoading: settingsLoading,
    getTodaBaseFare
  } = useSettings();
  
  const { toast } = useToast();

  const [localDefaultBaseFare, setLocalDefaultBaseFare] = React.useState<string>(defaultBaseFare.toString());
  const [localPerKmCharge, setLocalPerKmCharge] = React.useState<string>(perKmCharge.toString());
  const [localConvenienceFee, setLocalConvenienceFee] = React.useState<string>(convenienceFee.toString());
  const [localTodaBaseFares, setLocalTodaBaseFares] = React.useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedZoneForModal, setSelectedZoneForModal] = React.useState<TodaZone | null>(null);
  const [editingFareInModal, setEditingFareInModal] = React.useState<string>('');

  React.useEffect(() => {
    if (!settingsLoading) {
      setLocalDefaultBaseFare(defaultBaseFare.toString());
      setLocalPerKmCharge(perKmCharge.toString());
      setLocalConvenienceFee(convenienceFee.toString());
      const initialLocalTodaFares: Record<string, string> = {};
      appTodaZones.forEach(zone => {
        initialLocalTodaFares[zone.id] = getTodaBaseFare(zone.id).toString();
      });
      setLocalTodaBaseFares(initialLocalTodaFares);
    }
  }, [settingsLoading, defaultBaseFare, perKmCharge, convenienceFee, todaBaseFares, getTodaBaseFare]);

  const handleSaveAllSettings = () => {
    const newDefaultBaseFare = parseFloat(localDefaultBaseFare);
    const newPerKmCharge = parseFloat(localPerKmCharge);
    const newConvenienceFee = parseFloat(localConvenienceFee);

    if (isNaN(newDefaultBaseFare) || newDefaultBaseFare < 0) {
      toast({ title: "Invalid Default Base Fare", description: "Must be a non-negative number.", variant: "destructive" });
      return;
    }
    if (isNaN(newPerKmCharge) || newPerKmCharge < 0) {
      toast({ title: "Invalid Per KM Charge", description: "Must be a non-negative number.", variant: "destructive" });
      return;
    }
    if (isNaN(newConvenienceFee) || newConvenienceFee < 0) {
      toast({ title: "Invalid Convenience Fee", description: "Must be a non-negative number.", variant: "destructive" });
      return;
    }

    const updatedTodaSpecificFares: Record<string, number> = {};
    let specificFaresValid = true;
    for (const zoneId in localTodaBaseFares) {
      const fareVal = parseFloat(localTodaBaseFares[zoneId]);
      if (isNaN(fareVal) || fareVal < 0) {
        toast({ title: "Invalid TODA Base Fare", description: `Base fare for ${appTodaZones.find(z => z.id === zoneId)?.name} must be a non-negative number.`, variant: "destructive" });
        specificFaresValid = false;
        break;
      }
      updatedTodaSpecificFares[zoneId] = fareVal;
    }

    if (!specificFaresValid) return;

    updateSetting('defaultBaseFare', newDefaultBaseFare);
    updateSetting('perKmCharge', newPerKmCharge);
    updateSetting('convenienceFee', newConvenienceFee);
    updateSetting('todaBaseFares', updatedTodaSpecificFares);
    
    toast({ title: "Fare Settings Saved", description: "Fare matrix has been updated." });
  };

  const openZoneModal = (zone: TodaZone) => {
    setSelectedZoneForModal(zone);
    setEditingFareInModal(localTodaBaseFares[zone.id] || getTodaBaseFare(zone.id).toString());
    setIsModalOpen(true);
  };

  const handleSaveModalFare = () => {
    if (selectedZoneForModal) {
      const newFare = parseFloat(editingFareInModal);
      if (isNaN(newFare) || newFare < 0) {
        toast({ title: "Invalid Base Fare", description: "Base fare must be a non-negative number.", variant: "destructive" });
        return;
      }
      setLocalTodaBaseFares(prev => ({
        ...prev,
        [selectedZoneForModal.id]: newFare.toString()
      }));
      toast({ title: "TODA Fare Updated (Locally)", description: `Base fare for ${selectedZoneForModal.name} set to ₱${newFare.toFixed(2)}. Save all changes to persist.` });
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
            <CardDescription>Set the default fare structure for all TODAs. Specific TODAs can have their base fares overridden below.</CardDescription>
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
              <CardTitle className="flex items-center"><Edit className="mr-2 h-5 w-5 text-primary"/> TODA-Specific Base Fares</CardTitle>
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
            <CardDescription>Click on a TODA zone to view details and override its default base fare. Active Rides and Trider counts are mocked for demo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredZones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map(zone => {
                  const counts = getMockTriderCounts(zone.id);
                  const currentFare = parseFloat(localTodaBaseFares[zone.id] || getTodaBaseFare(zone.id).toString()).toFixed(2);
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
                            <DialogTitle>Edit Base Fare: {selectedZoneForModal.name}</DialogTitle>
                            <DialogDescription>{selectedZoneForModal.areaOfOperation}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <Label htmlFor={`fare-modal-${selectedZoneForModal.id}`}>Base Fare (PHP)</Label>
                              <Input
                                id={`fare-modal-${selectedZoneForModal.id}`}
                                type="number"
                                value={editingFareInModal}
                                onChange={e => setEditingFareInModal(e.target.value)}
                                min="0"
                                step="0.01"
                                className="mt-1"
                              />
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
                                <SelectTrigger id="special-conditions" className="mt-1">
                                  <SelectValue placeholder="None" />
                                </SelectTrigger>
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
                              <Textarea 
                                id="additional-notes"
                                className="mt-1 resize-none h-20" 
                                placeholder="Any special instructions or rules for this TODA..."
                              />
                               <p className="text-xs text-muted-foreground mt-1">This setting is for UI demonstration and is not currently saved.</p>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSaveModalFare}>Save Changes</Button>
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
            Save All Fare Settings
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
    