
"use client";

import * as React from 'react';
import { MapPin, Users, Bike, LogIn, UserCircle, CircleDollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import type { Coordinates, RideRequest, TriderSimState, TriderProfile, RoutePath } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const selfTriderProfileInitial: TriderProfile = {
  id: 'trider-self-sim',
  name: 'Juan Dela Cruz (You)',
  location: getRandomPointInCircle(appTodaZones[0].center, appTodaZones[0].radiusKm * 0.3),
  status: 'offline',
  vehicleType: 'E-Bike',
  todaZoneId: appTodaZones[0].id,
  todaZoneName: appTodaZones[0].name,
  profilePictureUrl: `https://placehold.co/100x100.png?text=You`,
  dataAiHint: "driver person",
  wallet: { currentBalance: 250.75, totalEarnedAllTime: 1250.50, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
  currentPath: null,
  pathIndex: 0,
};


export default function TriderPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();

  const [triderProfile, setTriderProfile] = React.useState<TriderProfile>(selfTriderProfileInitial);

  const [viewState, setViewState] = React.useState({
    longitude: triderProfile.location.longitude,
    latitude: triderProfile.location.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45,
  });

  const [triderState, setTriderState] = React.useState<TriderSimState>({
    status: 'offline',
    currentLocation: triderProfile.location,
    activeRideRequest: null,
    availableRideRequests: [],
    currentPath: null,
    currentPathIndex: 0,
  });
  
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [routeColor, setRouteColor] = React.useState('hsl(var(--accent))');


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      const accentColorVar = computedStyles.getPropertyValue('--accent').trim();
      const parseHsl = (hslString: string) => {
        const parts = hslString.split(' ').map(p => p.trim());
        if (parts.length === 3 && !hslString.startsWith('hsl(')) {
            const h = parts[0];
            const s = parts[1].endsWith('%') ? parts[1] : `${parts[1]}%`;
            const l = parts[2].endsWith('%') ? parts[2] : `${parts[2]}%`;
            return `hsl(${h}, ${s}, ${l})`;
        }
        return hslString;
      };
      setRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'green');
    }
  }, []);


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

  const handleStatusToast = React.useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({ title, description, variant });
  }, [toast]);


  React.useEffect(() => {
    let requestIntervalId: NodeJS.Timeout;
    if (triderState.status === 'onlineAvailable') {
      requestIntervalId = setInterval(() => {
        const triderZone = appTodaZones.find(z => z.id === triderProfile.todaZoneId);
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
        setTriderState(prev => ({
          ...prev,
          availableRideRequests: [newRide, ...prev.availableRideRequests.slice(0, 4)]
        }));
        // Toast moved to a separate useEffect to avoid setstate in render issues
      }, 15000);
    }
    return () => clearInterval(requestIntervalId);
  }, [triderState.status, triderProfile.todaZoneId]);
  
  React.useEffect(() => {
    if(triderState.status === 'onlineAvailable' && triderState.availableRideRequests.length > 0) {
        const latestRequest = triderState.availableRideRequests[0];
        handleStatusToast("New Ride Request!", `From ${latestRequest.pickupAddress} to ${latestRequest.dropoffAddress}`);
    }
  }, [triderState.availableRideRequests, triderState.status, handleStatusToast]);


  React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;
    if (triderState.activeRideRequest && triderState.currentPath && (triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff')) {
      moveIntervalId = setInterval(() => {
        setTriderState(prev => {
          if (!prev.activeRideRequest || !prev.currentPath || prev.currentPathIndex === undefined) return prev;
          
          const targetLocation = prev.status === 'onlineBusyEnRouteToPickup' ? prev.activeRideRequest.pickupLocation : prev.activeRideRequest.dropoffLocation;
          let nextIdx = prev.currentPathIndex + 1;

          if (nextIdx < prev.currentPath.coordinates.length) {
            const newLocation = {
              longitude: prev.currentPath.coordinates[nextIdx][0],
              latitude: prev.currentPath.coordinates[nextIdx][1],
            };
            return { ...prev, currentLocation: newLocation, currentPathIndex: nextIdx };
          } else { // Reached end of path
            if (prev.status === 'onlineBusyEnRouteToPickup') {
              // Toast moved to status change effect
            } else if (prev.status === 'onlineBusyEnRouteToDropoff') {
              // Toast moved to status change effect
            }
            return { ...prev, currentLocation: targetLocation, currentPathIndex: prev.currentPath.coordinates.length -1 }; // Stay at end
          }
        });
      }, 2000); // Simulation interval
    }
    return () => clearInterval(moveIntervalId);
  }, [triderState.status, triderState.activeRideRequest, triderState.currentPath]);


  React.useEffect(() => {
    if (triderState.activeRideRequest) {
        if (triderState.status === 'onlineBusyEnRouteToPickup' && calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) < 0.05) {
             // This logic is now handled by checking path end. Toast for arrival will be triggered by button click.
        } else if (triderState.status === 'onlineBusyEnRouteToDropoff' && calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) < 0.05) {
            // Logic handled by path end. Toast for completion by button.
        }
    }
  }, [triderState.currentLocation, triderState.status, triderState.activeRideRequest, handleStatusToast]);


  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setTriderState(prev => ({ ...prev, status: 'onlineAvailable', currentLocation: coords }));
          setTriderProfile(prev => ({ ...prev, location: coords }));
          setViewState(prev => ({ ...prev, ...coords, zoom: 16 }));
          setIsGeolocating(false);
          handleStatusToast("You are Online!", "Waiting for ride requests.");
        },
        (error) => {
          console.warn("Error getting geolocation for trider:", error.message);
          // Fallback to TODA zone center if geolocation fails
          const currentTodaZone = appTodaZones.find(z => z.id === triderProfile.todaZoneId) || appTodaZones[0];
          setTriderState(prev => ({ ...prev, status: 'onlineAvailable', currentLocation: currentTodaZone.center }));
          setTriderProfile(prev => ({ ...prev, location: currentTodaZone.center }));
          setViewState(prev => ({ ...prev, ...currentTodaZone.center, zoom: 15 }));
          setIsGeolocating(false);
          handleStatusToast("You are Online!", "Using default zone location. Waiting for ride requests.");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (triderState.activeRideRequest) {
        handleStatusToast("Cannot Go Offline", "Please complete or cancel your active ride first.", "destructive");
        return;
      }
      setTriderState(prev => ({ ...prev, status: 'offline', availableRideRequests: [], activeRideRequest: null, currentPath: null, currentPathIndex: 0 }));
      handleStatusToast("You are Offline", "");
    }
  };

  const fetchAndSetRoute = async (start: Coordinates, end: Coordinates) => {
    if (!MAPBOX_TOKEN) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const path: RoutePath = data.routes[0].geometry;
        setTriderState(prev => ({ ...prev, currentPath: path, currentPathIndex: 0 }));
        return path;
      }
    } catch (error) {
      console.error("Error fetching route for trider map:", error);
      handleStatusToast("Route Error", "Could not calculate route.", "destructive");
    }
    return null;
  };

  const handleAcceptRide = async (request: RideRequest) => {
    if (triderState.status !== 'onlineAvailable') {
      handleStatusToast("Cannot Accept Ride", "You must be online and available.", "destructive");
      return;
    }
    if (request.pickupTodaZoneId !== triderProfile.todaZoneId) {
        handleStatusToast("Out of Zone", "This ride request is outside your assigned TODA zone.", "destructive");
        return;
    }

    const path = await fetchAndSetRoute(triderState.currentLocation, request.pickupLocation);
    if (path) {
        setTriderState(prev => ({
        ...prev,
        status: 'onlineBusyEnRouteToPickup',
        activeRideRequest: request,
        availableRideRequests: prev.availableRideRequests.filter(r => r.id !== request.id)
        }));
        handleStatusToast("Ride Accepted!", `Proceed to ${request.pickupAddress}.`);
    }
  };
  
  const handlePickedUp = async () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToPickup') return;
    if (calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) > 0.1) { // More lenient check
        handleStatusToast("Not at Pickup Yet", "Please proceed closer to the pickup location.", "destructive");
        return;
    }
    const path = await fetchAndSetRoute(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation);
    if (path) {
        setTriderState(prev => ({...prev, status: 'onlineBusyEnRouteToDropoff'}));
        handleStatusToast("Passenger Picked Up", `Proceed to ${triderState.activeRideRequest.dropoffAddress}.`);
    }
  };

  const handleCompleteRide = () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToDropoff') return;
     if (calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) > 0.1) { // More lenient check
        handleStatusToast("Not at Dropoff Yet", "Please proceed closer to the destination.", "destructive");
        return;
    }
    const fare = triderState.activeRideRequest.fare || 0;
    const earnings = fare * 0.8; // Assume 20% commission
    
    setTriderProfile(prev => ({
        ...prev,
        wallet: {
            ...prev.wallet,
            currentBalance: prev.wallet.currentBalance + earnings,
            totalEarnedAllTime: prev.wallet.totalEarnedAllTime + earnings,
            todayTotalRides: prev.wallet.todayTotalRides + 1,
            todayTotalFareCollected: prev.wallet.todayTotalFareCollected + fare,
            todayNetEarnings: prev.wallet.todayNetEarnings + earnings,
        }
    }));

    setTriderState(prev => ({
        ...prev, status: 'onlineAvailable', activeRideRequest: null, currentPath: null, currentPathIndex: 0,
    }));
    handleStatusToast("Ride Completed!", `Earned ₱${earnings.toFixed(2)}. Waiting for next ride.`);
  };
  
  const routeLayerConfig: any = {
    id: 'route-trider', type: 'line', source: 'route-trider',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': routeColor, 'line-width': 5, 'line-opacity': 0.8 },
  };


  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /><p>Loading Trider Dashboard...</p></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <Bike className="mr-2" /> TriGo Trider Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="online-toggle" className={triderState.status !== 'offline' ? "text-accent" : "text-muted-foreground"}>
            {isGeolocating ? "Geolocating..." : (triderState.status !== 'offline' ? 'Online' : 'Offline')}
          </Label>
          <Switch
            id="online-toggle"
            checked={triderState.status !== 'offline'}
            onCheckedChange={handleToggleOnline}
            disabled={isGeolocating || triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff'}
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
                    <Button onClick={handlePickedUp} className="w-full mt-2" disabled={calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) > 0.1}>Mark as Picked Up</Button>}
                  {triderState.status === 'onlineBusyEnRouteToDropoff' && 
                    <Button onClick={handleCompleteRide} className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) > 0.1}>Complete Ride</Button>}
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
                                <Button size="sm" onClick={() => handleAcceptRide(req)} disabled={req.pickupTodaZoneId !== triderProfile.todaZoneId}>
                                    Accept
                                </Button>
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">
                                From: {req.pickupAddress} ({appTodaZones.find(z=>z.id === req.pickupTodaZoneId)?.name})
                            </p>
                             <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(req.requestedAt, { addSuffix: true })}
                            </p>
                             {req.pickupTodaZoneId !== triderProfile.todaZoneId && <Badge variant="destructive" className="mt-1 text-xs">Out of Zone</Badge>}
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
                <CardTitle className="text-md flex items-center"><UserCircle className="mr-2"/>{triderProfile.name}</CardTitle>
                <CardDescription>{triderProfile.todaZoneName} - {triderProfile.vehicleType}</CardDescription>
             </CardHeader>
             <CardContent className="text-sm">
                <p><CircleDollarSign className="inline mr-1 h-4 w-4"/>Balance: ₱{triderProfile.wallet.currentBalance.toFixed(2)}</p>
                <p>Today's Rides: {triderProfile.wallet.todayTotalRides}</p>
                <p>Today's Earnings: ₱{triderProfile.wallet.todayNetEarnings.toFixed(2)}</p>
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
                <Bike size={20} data-ai-hint="motorcycle location"/>
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
                req.pickupTodaZoneId === triderProfile.todaZoneId &&
                <Marker key={`req-${req.id}`} longitude={req.pickupLocation.longitude} latitude={req.pickupLocation.latitude}>
                     <button onClick={() => handleAcceptRide(req)} title={`Accept ride for ${req.passengerName}`} className="cursor-pointer">
                        <div className="p-1.5 rounded-full bg-yellow-400 text-yellow-900 shadow-md hover:scale-110 transition-transform" data-ai-hint="passenger pickup">
                            <Users size={18}/>
                        </div>
                     </button>
                </Marker>
            ))}

            {triderState.currentPath && (
              <Source id="route-trider" type="geojson" data={{ type: 'Feature', geometry: triderState.currentPath, properties:{} }}>
                {/* @ts-ignore */}
                <Layer {...routeLayerConfig} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}

