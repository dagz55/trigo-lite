
"use client";

import * as React from 'react';
import { MapPin, Users, Bike, LogIn, UserCircle, CircleDollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import type { Coordinates, RideRequest, TriderSimState, TriderProfile } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Mock Trider Profile for this demo
const selfTriderProfile: TriderProfile = {
  id: 'trider-self-sim',
  name: 'Juan Dela Cruz (You)',
  location: getRandomPointInCircle(appTodaZones[0].center, appTodaZones[0].radiusKm * 0.3), // Start in first TODA zone
  status: 'offline', // Start offline
  vehicleType: 'E-Bike',
  todaZoneId: appTodaZones[0].id,
  todaZoneName: appTodaZones[0].name,
  profilePictureUrl: `https://placehold.co/100x100.png?text=You`,
  wallet: { currentBalance: 250.75, totalEarnedAllTime: 1250.50, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
};


export default function TriderPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();

  const [viewState, setViewState] = React.useState({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45,
  });

  const [triderState, setTriderState] = React.useState<TriderSimState>({
    status: 'offline',
    currentLocation: selfTriderProfile.location,
    activeRideRequest: null,
    availableRideRequests: [],
  });
  
  const [mapRouteGeoJson, setMapRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [resolvedAccentColor, setResolvedAccentColor] = React.useState<string>('hsl(120, 60.8%, 50%)');

   React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      const accentColorVar = computedStyles.getPropertyValue('--accent').trim();
      if (accentColorVar) {
        const parts = accentColorVar.split(' ').map(p => p.trim());
        if (parts.length === 3 && !accentColorVar.startsWith('hsl(')) {
            const h = parts[0];
            const s = parts[1].endsWith('%') ? parts[1] : `${parts[1]}%`;
            const l = parts[2].endsWith('%') ? parts[2] : `${parts[2]}%`;
            setResolvedAccentColor(`hsl(${h}, ${s}, ${l})`);
        } else {
            setResolvedAccentColor(accentColorVar);
        }
      }
    }
  }, []);


  // Update map view when settings load or change, or trider location changes
  React.useEffect(() => {
    if (!settingsLoading) {
      setViewState(prev => ({
        ...prev,
        longitude: triderState.currentLocation.longitude,
        latitude: triderState.currentLocation.latitude,
        zoom: defaultMapZoom + 2, 
      }));
    }
  }, [triderState.currentLocation, defaultMapZoom, settingsLoading]);

  // Toasts for trider status changes / events
  React.useEffect(() => {
    if (triderState.status === 'onlineBusyEnRouteToPickup' && triderState.activeRideRequest) {
        // This toast is triggered by handlePickedUp action or arrival
    } else if (triderState.status === 'onlineBusyEnRouteToDropoff' && triderState.activeRideRequest) {
        // This toast is triggered by handleCompleteRide action or arrival
    }
  }, [triderState.status, triderState.activeRideRequest, toast]);


  // Simulate receiving new ride requests when online and available
  React.useEffect(() => {
    let requestIntervalId: NodeJS.Timeout;
    if (triderState.status === 'onlineAvailable') {
      requestIntervalId = setInterval(() => {
        const triderZone = appTodaZones.find(z => z.id === selfTriderProfile.todaZoneId);
        if (!triderZone) return;

        const pickupLocation = getRandomPointInCircle(triderZone.center, triderZone.radiusKm * 0.8);
        const randomDropoffZone = appTodaZones[Math.floor(Math.random() * appTodaZones.length)];
        const dropoffLocation = getRandomPointInCircle(randomDropoffZone.center, randomDropoffZone.radiusKm * 0.8);
        
        const newRide: RideRequest = {
          id: `ride-req-sim-${Date.now()}`,
          passengerName: `Passenger ${Math.floor(Math.random() * 100)}`,
          pickupLocation, dropoffLocation,
          pickupAddress: `Near ${triderZone.name}`, dropoffAddress: `Near ${randomDropoffZone.name}`,
          status: 'pending', fare: calculateDistance(pickupLocation, dropoffLocation) * 20 + 30,
          requestedAt: new Date(), pickupTodaZoneId: triderZone.id,
        };
        setTriderState(prev => ({ ...prev, availableRideRequests: [newRide, ...prev.availableRideRequests.slice(0, 4)] }));
        toast({ title: "New Ride Request!", description: `From ${newRide.pickupAddress} to ${newRide.dropoffAddress}`});
      }, 15000); 
    }
    return () => clearInterval(requestIntervalId);
  }, [triderState.status, toast]); // Added toast

  // Simulate trider movement for active ride
  React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;
    if (triderState.activeRideRequest && (triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff')) {
      const targetLocation = triderState.status === 'onlineBusyEnRouteToPickup' ? triderState.activeRideRequest.pickupLocation : triderState.activeRideRequest.dropoffLocation;
      
      moveIntervalId = setInterval(() => {
        setTriderState(prev => {
          if (!prev.activeRideRequest || !targetLocation) return prev;
          if (calculateDistance(prev.currentLocation, targetLocation) < 0.05) { 
            if (prev.status === 'onlineBusyEnRouteToPickup') {
              toast({ title: "Arrived at Pickup", description: `Inform ${prev.activeRideRequest.passengerName}.`});
              if(prev.activeRideRequest.dropoffLocation) fetchRoute(prev.currentLocation, prev.activeRideRequest.dropoffLocation);
            } else { 
              toast({ title: "Arrived at Destination", description: "Complete the ride." });
              setMapRouteGeoJson(null);
            }
            return { ...prev, currentLocation: targetLocation }; 
          }
          const newLat = prev.currentLocation.latitude + (targetLocation.latitude - prev.currentLocation.latitude) * 0.3;
          const newLng = prev.currentLocation.longitude + (targetLocation.longitude - prev.currentLocation.longitude) * 0.3;
          const newLocation = {latitude: newLat, longitude: newLng};
          fetchRoute(newLocation, targetLocation); 
          return { ...prev, currentLocation: newLocation };
        });
      }, 2000);
    }
    return () => clearInterval(moveIntervalId);
  }, [triderState.status, triderState.activeRideRequest, toast]); // Added toast


  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) {
      setTriderState(prev => ({ ...prev, status: 'onlineAvailable', currentLocation: selfTriderProfile.location }));
      toast({ title: "You are Online!", description: "Waiting for ride requests." });
    } else {
      if (triderState.activeRideRequest) {
        toast({ title: "Cannot Go Offline", description: "Please complete or cancel your active ride first.", variant: "destructive" });
        return;
      }
      setTriderState(prev => ({ ...prev, status: 'offline', availableRideRequests: [], activeRideRequest: null }));
      setMapRouteGeoJson(null);
      toast({ title: "You are Offline" });
    }
  };

  const handleAcceptRide = (request: RideRequest) => {
    if (triderState.status !== 'onlineAvailable') {
      toast({ title: "Cannot Accept Ride", description: "You must be online and available.", variant: "destructive" });
      return;
    }
    if (request.pickupTodaZoneId !== selfTriderProfile.todaZoneId) {
        toast({ title: "Out of Zone", description: "This ride request is outside your assigned TODA zone.", variant: "destructive" });
        return;
    }

    setTriderState(prev => ({
      ...prev,
      status: 'onlineBusyEnRouteToPickup',
      activeRideRequest: request,
      availableRideRequests: prev.availableRideRequests.filter(r => r.id !== request.id)
    }));
    fetchRoute(triderState.currentLocation, request.pickupLocation);
    toast({ title: "Ride Accepted!", description: `Proceed to ${request.pickupAddress}.` });
  };
  
  const fetchRoute = async (start: Coordinates, end: Coordinates) => {
    if (!MAPBOX_TOKEN) return;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setMapRouteGeoJson({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: data.routes[0].geometry }] });
      } else {
        setMapRouteGeoJson(null);
      }
    } catch (error) {
      console.error("Error fetching route for trider map:", error);
      setMapRouteGeoJson(null);
    }
  };

  const handlePickedUp = () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToPickup') return;
    if (calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) > 0.1) {
        toast({title: "Not at Pickup Yet", description: "Please proceed closer to the pickup location.", variant: "destructive"});
        return;
    }
    setTriderState(prev => ({...prev, status: 'onlineBusyEnRouteToDropoff'}));
    fetchRoute(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation);
    toast({title: "Passenger Picked Up", description: `Proceed to ${triderState.activeRideRequest.dropoffAddress}.`});
  };

  const handleCompleteRide = () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToDropoff') return;
    if (calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) > 0.1) {
        toast({title: "Not at Dropoff Yet", description: "Please proceed closer to the destination.", variant: "destructive"});
        return;
    }
    const fare = triderState.activeRideRequest.fare || 0;
    selfTriderProfile.wallet.currentBalance += fare * 0.8; 
    selfTriderProfile.wallet.totalEarnedAllTime += fare * 0.8;
    selfTriderProfile.wallet.todayTotalRides += 1;
    selfTriderProfile.wallet.todayTotalFareCollected += fare;
    selfTriderProfile.wallet.todayNetEarnings += fare * 0.8;

    setTriderState(prev => ({ ...prev, status: 'onlineAvailable', activeRideRequest: null }));
    setMapRouteGeoJson(null);
    toast({ title: "Ride Completed!", description: `Earned ₱${(fare * 0.8).toFixed(2)}. Waiting for next ride.` });
  };
  
  const routeLayer: any = React.useMemo(() => ({
    id: 'route-trider',
    type: 'line',
    source: 'route-trider',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': resolvedAccentColor, 'line-width': 5, 'line-opacity': 0.8 },
  }), [resolvedAccentColor]);


  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><p>Loading Trider Dashboard...</p></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <Bike className="mr-2" /> TriGo Trider Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="online-toggle" className={triderState.status !== 'offline' ? "text-accent" : "text-muted-foreground"}>
            {triderState.status !== 'offline' ? 'Online' : 'Offline'}
          </Label>
          <Switch
            id="online-toggle"
            checked={triderState.status !== 'offline'}
            onCheckedChange={handleToggleOnline}
            disabled={triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff'}
          />
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 md:p-4 overflow-hidden">
        <div className="md:col-span-1 flex flex-col gap-4 p-4 md:p-0 h-full">
          <Card className="shadow-lg flex-shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{triderState.activeRideRequest ? "Active Ride" : "Available Requests"}</span>
                 <Badge variant={triderState.status === 'offline' ? "destructive" : triderState.status === 'onlineAvailable' ? "default" : "secondary"} className="capitalize">
                  {triderState.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[150px]">
              {triderState.activeRideRequest ? (
                <div className="space-y-2">
                  <p><strong>Passenger:</strong> {triderState.activeRideRequest.passengerName}</p>
                  <p className="text-sm"><strong>From:</strong> {triderState.activeRideRequest.pickupAddress}</p>
                  <p className="text-sm"><strong>To:</strong> {triderState.activeRideRequest.dropoffAddress}</p>
                  <p className="text-sm"><strong>Est. Fare:</strong> ₱{triderState.activeRideRequest.fare?.toFixed(2)}</p>
                  {triderState.status === 'onlineBusyEnRouteToPickup' && 
                    <Button onClick={handlePickedUp} className="w-full mt-2">Mark as Picked Up</Button>}
                  {triderState.status === 'onlineBusyEnRouteToDropoff' && 
                    <Button onClick={handleCompleteRide} className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">Complete Ride</Button>}
                </div>
              ) : triderState.availableRideRequests.length > 0 ? (
                 <ScrollArea className="h-[200px] pr-3">
                    <ul className="space-y-3">
                    {triderState.availableRideRequests.map(req => (
                        <li key={req.id} className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">{req.passengerName}</p>
                                    <p className="text-xs text-muted-foreground">To: {req.dropoffAddress}</p>
                                    <p className="text-xs text-muted-foreground">Fare: ~₱{req.fare?.toFixed(2)}</p>
                                </div>
                                <Button size="sm" onClick={() => handleAcceptRide(req)} disabled={req.pickupTodaZoneId !== selfTriderProfile.todaZoneId}>
                                    Accept
                                </Button>
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">
                                From: {req.pickupAddress} ({appTodaZones.find(z=>z.id === req.pickupTodaZoneId)?.name})
                            </p>
                             <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(req.requestedAt, { addSuffix: true })}
                            </p>
                             {req.pickupTodaZoneId !== selfTriderProfile.todaZoneId && <Badge variant="destructive" className="mt-1 text-xs">Out of Zone</Badge>}
                        </li>
                    ))}
                    </ul>
                 </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {triderState.status === 'onlineAvailable' ? "No ride requests currently. Waiting..." : "Go online to see ride requests."}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg mt-auto">
             <CardHeader>
                <CardTitle className="text-md flex items-center"><UserCircle className="mr-2"/>{selfTriderProfile.name}</CardTitle>
                <CardDescription>{selfTriderProfile.todaZoneName} - {selfTriderProfile.vehicleType}</CardDescription>
             </CardHeader>
             <CardContent className="text-sm">
                <p><CircleDollarSign className="inline mr-1 h-4 w-4"/>Balance: ₱{selfTriderProfile.wallet.currentBalance.toFixed(2)}</p>
                <p>Today's Rides: {selfTriderProfile.wallet.todayTotalRides}</p>
                <p>Today's Earnings: ₱{selfTriderProfile.wallet.todayNetEarnings.toFixed(2)}</p>
             </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={triderState.currentLocation.longitude} latitude={triderState.currentLocation.latitude}>
              <div className={`p-1.5 rounded-full shadow-md ${triderState.status === 'offline' ? 'bg-muted' : 'bg-primary text-primary-foreground animate-pulse'}`}>
                <Bike size={20} data-ai-hint="motorcycle rider"/>
              </div>
            </Marker>

            {triderState.activeRideRequest && (
              <>
                <Marker longitude={triderState.activeRideRequest.pickupLocation.longitude} latitude={triderState.activeRideRequest.pickupLocation.latitude} color="green">
                   <div title="Pickup" className="p-1 rounded-full bg-green-500 text-white shadow-md"><MapPin size={16}/></div>
                </Marker>
                <Marker longitude={triderState.activeRideRequest.dropoffLocation.longitude} latitude={triderState.activeRideRequest.dropoffLocation.latitude} color="red">
                    <div title="Dropoff" className="p-1 rounded-full bg-red-500 text-white shadow-md"><MapPin size={16}/></div>
                </Marker>
              </>
            )}
            
            {triderState.status === 'onlineAvailable' && triderState.availableRideRequests.map(req => (
                req.pickupTodaZoneId === selfTriderProfile.todaZoneId && 
                <Marker key={`req-${req.id}`} longitude={req.pickupLocation.longitude} latitude={req.pickupLocation.latitude}>
                     <button onClick={() => handleAcceptRide(req)} title={`Accept ride for ${req.passengerName}`} className="cursor-pointer">
                        <div className="p-1.5 rounded-full bg-yellow-400 text-yellow-900 shadow-md hover:scale-110 transition-transform">
                            <Users size={18}/>
                        </div>
                     </button>
                </Marker>
            ))}

            {mapRouteGeoJson && (
              <Source id="route-trider" type="geojson" data={mapRouteGeoJson}>
                <Layer {...routeLayer} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
