"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DispatcherZoneSelectionPage() {
  const router = useRouter();
  const { isLoading: settingsLoading } = useSettings();

  const groupedTodaZones = React.useMemo(() => {
    const groups: { [key: string]: typeof appTodaZones } = {};
    appTodaZones.forEach(zone => {
      const area = zone.areaOfOperation.split(',')[0].trim(); // Use the first part as "City"
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(zone);
    });
    return groups;
  }, []);

  const handleZoneSelect = (todaId: string) => {
    router.push(`/dispatcher/toda/${todaId}`);
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Select TODA Dispatcher Zone</CardTitle>
          <CardDescription className="text-center">Choose a TODA zone to view its specific dispatcher dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleZoneSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a TODA Zone" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedTodaZones).map(([area, zones]) => (
                <SelectGroup key={area}>
                  <SelectLabel>{area}</SelectLabel>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} - {zone.areaOfOperation}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
