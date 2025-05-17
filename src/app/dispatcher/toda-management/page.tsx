
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Edit } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones'; // For listing TODAs
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TodaManagementPage() {
  const { 
    defaultBaseFare,
    perKmCharge,
    convenienceFee,
    todaBaseFares,
    updateSetting,
    isLoading: settingsLoading 
  } = useSettings();
  
  const { toast } = useToast();

  // Local state for inputs to avoid re-rendering context on every keystroke
  const [localDefaultBaseFare, setLocalDefaultBaseFare] = React.useState<string>(defaultBaseFare.toString());
  const [localPerKmCharge, setLocalPerKmCharge] = React.useState<string>(perKmCharge.toString());
  const [localConvenienceFee, setLocalConvenienceFee] = React.useState<string>(convenienceFee.toString());
  const [localTodaBaseFares, setLocalTodaBaseFares] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!settingsLoading) {
      setLocalDefaultBaseFare(defaultBaseFare.toString());
      setLocalPerKmCharge(perKmCharge.toString());
      setLocalConvenienceFee(convenienceFee.toString());
      const initialLocalTodaFares: Record<string, string> = {};
      appTodaZones.forEach(zone => {
        initialLocalTodaFares[zone.id] = (todaBaseFares[zone.id] ?? defaultBaseFare).toString();
      });
      setLocalTodaBaseFares(initialLocalTodaFares);
    }
  }, [settingsLoading, defaultBaseFare, perKmCharge, convenienceFee, todaBaseFares]);

  const handleSaveFareSettings = () => {
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
            <CardTitle className="flex items-center"><Edit className="mr-2 h-5 w-5 text-primary"/> TODA-Specific Base Fares</CardTitle>
            <CardDescription>Override the default base fare for specific TODA zones. If not set, the global default base fare will apply.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {appTodaZones.map(zone => (
                <div key={zone.id}>
                  <Label htmlFor={`fare-override-${zone.id}`}>{zone.name} ({zone.areaOfOperation})</Label>
                  <Input
                    id={`fare-override-${zone.id}`}
                    type="number"
                    placeholder={`Default: ${defaultBaseFare.toFixed(2)}`}
                    value={localTodaBaseFares[zone.id] ?? ''}
                    onChange={e => setLocalTodaBaseFares(prev => ({ ...prev, [zone.id]: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveFareSettings}>Save Fare Settings</Button>
        </div>

        <Separator />

        <Card>
          <CardHeader><CardTitle>Manage TODA Zones</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to Add, Modify, or Delete TODA zones (including their names, operational areas, map boundaries) will be implemented here. 
              This requires database integration. For now, TODA zones are managed in `src/data/todaZones.ts`.
            </p>
            {/* Placeholder for future TODA CRUD UI */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Manage Triders within TODAs</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to assign triders to specific TODAs, remove them, or modify their details within a TODA context will be implemented here.
              This requires database integration. Trider profiles and their TODA assignments are currently managed in `src/app/dispatcher/triders/page.tsx` and related files.
            </p>
            {/* Placeholder for future Trider-in-TODA CRUD UI */}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Manage Demo Passenger Profiles</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Functionality to Add, Modify, or Delete demo passenger profiles for testing scenarios will be implemented here.
              This requires database integration. Demo passenger profiles are currently managed in `src/data/mockPassengerProfiles.ts`.
            </p>
            {/* Placeholder for future Passenger CRUD UI */}
          </CardContent>
        </Card>

      </div>
    </ScrollArea>
  );
}
