
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';
import type { ThemeSetting, Coordinates } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { 
    theme, 
    defaultMapZoom, 
    defaultMapCenter, 
    showHeatmap, 
    rideRequestIntervalMs, 
    triderUpdateIntervalMs, 
    aiInsightIntervalMs,
    updateSetting,
    resetSettings,
    isLoading 
  } = useSettings();
  
  const { toast } = useToast();

  // Local component state for form inputs to avoid re-rendering context on every keystroke
  const [localZoom, setLocalZoom] = React.useState<string>(defaultMapZoom.toString());
  const [localLat, setLocalLat] = React.useState<string>(defaultMapCenter.latitude.toString());
  const [localLng, setLocalLng] = React.useState<string>(defaultMapCenter.longitude.toString());
  const [localRideInterval, setLocalRideInterval] = React.useState<string>((rideRequestIntervalMs / 1000).toString());
  const [localTriderInterval, setLocalTriderInterval] = React.useState<string>((triderUpdateIntervalMs / 1000).toString());
  const [localAiInterval, setLocalAiInterval] = React.useState<string>((aiInsightIntervalMs / 1000).toString());

  React.useEffect(() => {
    if (!isLoading) {
      setLocalZoom(defaultMapZoom.toString());
      setLocalLat(defaultMapCenter.latitude.toString());
      setLocalLng(defaultMapCenter.longitude.toString());
      setLocalRideInterval((rideRequestIntervalMs / 1000).toString());
      setLocalTriderInterval((triderUpdateIntervalMs / 1000).toString());
      setLocalAiInterval((aiInsightIntervalMs / 1000).toString());
    }
  }, [isLoading, defaultMapZoom, defaultMapCenter, rideRequestIntervalMs, triderUpdateIntervalMs, aiInsightIntervalMs]);


  const handleThemeChange = (value: string) => {
    updateSetting('theme', value as ThemeSetting);
    toast({ title: "Theme Updated", description: `Theme set to ${value}.` });
  };

  const handleShowHeatmapChange = (checked: boolean) => {
    updateSetting('showHeatmap', checked);
    toast({ title: "Heatmap Visibility Updated" });
  };

  const handleSaveMapDefaults = () => {
    const zoom = parseFloat(localZoom);
    const lat = parseFloat(localLat);
    const lng = parseFloat(localLng);

    if (isNaN(zoom) || zoom < 1 || zoom > 22) {
      toast({ title: "Invalid Zoom", description: "Zoom level must be between 1 and 22.", variant: "destructive" });
      return;
    }
    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast({ title: "Invalid Latitude", description: "Latitude must be between -90 and 90.", variant: "destructive" });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast({ title: "Invalid Longitude", description: "Longitude must be between -180 and 180.", variant: "destructive" });
      return;
    }
    updateSetting('defaultMapZoom', zoom);
    updateSetting('defaultMapCenter', { latitude: lat, longitude: lng });
    toast({ title: "Map Defaults Saved" });
  };
  
  const handleSaveSimulationIntervals = () => {
    const rideInt = parseInt(localRideInterval, 10) * 1000;
    const triderInt = parseInt(localTriderInterval, 10) * 1000;
    const aiInt = parseInt(localAiInterval, 10) * 1000;

    if (isNaN(rideInt) || rideInt <= 0 || isNaN(triderInt) || triderInt <=0 || isNaN(aiInt) || aiInt <=0) {
      toast({ title: "Invalid Interval", description: "Intervals must be positive numbers.", variant: "destructive" });
      return;
    }
    updateSetting('rideRequestIntervalMs', rideInt);
    updateSetting('triderUpdateIntervalMs', triderInt);
    updateSetting('aiInsightIntervalMs', aiInt);
    toast({ title: "Simulation Intervals Saved" });
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({ title: "Settings Reset", description: "All settings have been reset to default values." });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Application Settings</h1>
        <Button variant="outline" onClick={handleResetSettings} size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset All Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme-group">Theme</Label>
            <RadioGroup
              id="theme-group"
              value={theme}
              onValueChange={handleThemeChange}
              className="mt-2 flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">System</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map Configuration</CardTitle>
          <CardDescription>Set default map view and layer visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="map-zoom">Default Zoom Level</Label>
              <Input id="map-zoom" type="number" value={localZoom} onChange={e => setLocalZoom(e.target.value)} min="1" max="22" step="0.1" />
            </div>
            <div>
              <Label htmlFor="map-lat">Default Latitude</Label>
              <Input id="map-lat" type="number" value={localLat} onChange={e => setLocalLat(e.target.value)} min="-90" max="90" step="0.0001" />
            </div>
            <div>
              <Label htmlFor="map-lng">Default Longitude</Label>
              <Input id="map-lng" type="number" value={localLng} onChange={e => setLocalLng(e.target.value)} min="-180" max="180" step="0.0001" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="show-heatmap" className="flex flex-col">
              Show Ride Request Heatmap
              <span className="text-xs text-muted-foreground">Toggle heatmap layer visibility on the main map.</span>
            </Label>
            <Switch
              id="show-heatmap"
              checked={showHeatmap}
              onCheckedChange={handleShowHeatmapChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveMapDefaults}>Save Map Defaults</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Simulation</CardTitle>
          <CardDescription>Adjust mock data generation frequencies. Values are in seconds.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ride-interval">New Ride Request Interval (s)</Label>
            <Input id="ride-interval" type="number" value={localRideInterval} onChange={e => setLocalRideInterval(e.target.value)} min="1" />
          </div>
          <div>
            <Label htmlFor="trider-interval">Trider Location Update Interval (s)</Label>
            <Input id="trider-interval" type="number" value={localTriderInterval} onChange={e => setLocalTriderInterval(e.target.value)} min="1" />
          </div>
           <div>
            <Label htmlFor="ai-interval">AI Insight Interval (s)</Label>
            <Input id="ai-interval" type="number" value={localAiInterval} onChange={e => setLocalAiInterval(e.target.value)} min="1" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSimulationIntervals}>Save Simulation Intervals</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
