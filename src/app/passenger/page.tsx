
"use client";

import * as React from 'react';
import { MapPin, Dot, Search, Bike, User, ArrowRight, CircleDollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import type { Coordinates, PassengerRideState, TriderProfile, RideRequest, RideRequestStatus } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const mockTriders: TriderProfile[] = appTodaZones.slice(0, 5).map((zone, index) => ({
  id: `trider-sim-${index + 1}`,
  name: `Trider ${String.fromCharCode(65 + index)}`, 
  location: getRandomPointInCircle(zone.center, zone.radiusKm * 0.5),
  status: 'available',
  vehicleType: 'Tricycle',
  todaZoneId: zone.id,
  todaZoneName: zone.name,
  profilePictureUrl: `https://placehold.co/100x100.png?text=T${String.fromCharCode(65 + index)}`,
  dataAiHint: "driver portrait",
  wallet: { currentBalance: 100, totalEarnedAllTime: 500, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
}));


export default function PassengerPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();

  const [viewState, setViewState] = React.useState({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45, // Keep 3D perspective
  });

  const [rideState, setRideState] = React.useState<PassengerRideState>({
    status: 'idle',
    pickupLocation: null,
    dropoffLocation: null,
    pickupAddress: null,
    dropoffAddress: null,
    estimatedFare: null,
    assignedTrider: null,
    currentRideId: null,
  });

  const [triderSimLocation, setTriderSimLocation] = React.useState<Coordinates | null>(null);
  
  const [triderToPickupRouteGeoJson, setTriderToPickupRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [pickupToDropoffRouteGeoJson, setPickupToDropoffRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  
  const [currentTriderPath, setCurrentTriderPath] = React.useState<Coordinates[] | null>(null);
  const [currentTriderPathIndex, setCurrentTriderPathIndex] = React.useState(0);
  
  const [currentSegmentETA, setCurrentSegmentETA] = React.useState<string | null>(null);
  
  const [resolvedPrimaryColor, setResolvedPrimaryColor] = React.useState<string>('hsl(180, 100%, 25.1%)');
  const [resolvedAccentColor, setResolvedAccentColor] = React.useState<string>('hsl(120, 60.8%, 50%)');


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      const parseHslString = (hslString: string): string => {
        const parts = hslString.split(' ').map(p => p.trim());
        if (parts.length === 3 && !hslString.startsWith('hsl(')) {
            const h = parts[0];
            const s = parts[1].endsWith('%') ? parts[1] : `${parts[1]}%`;
            const l = parts[2].endsWith('%') ? parts[2] : `${parts[2]}%`;
            return `hsl(${h}, ${s}, ${l})`;
        }
        return hslString;
      };
      const primaryColorVar = computedStyles.getPropertyValue('--primary').trim();
      if (primaryColorVar) setResolvedPrimaryColor(parseHslString(primaryColorVar));
      
      const accentColorVar = computedStyles.getPropertyValue('--accent').trim();
      if (accentColorVar) setResolvedAccentColor(parseHslString(accentColorVar));
    }
  }, []);

  React.useEffect(() => {
    if (!settingsLoading) {
      setViewState(prev => ({
        ...prev,
        longitude: defaultMapCenter.longitude,
        latitude: defaultMapCenter.latitude,
        zoom: defaultMapZoom + 1, // Keep zoom level slightly higher for passenger
        pitch: 45, // Ensure pitch is maintained
      }));
    }
  }, [defaultMapCenter, defaultMapZoom, settingsLoading]);

  // Toasts for ride status changes, handled safely in useEffect
  React.useEffect(() => {
     if (rideState.status === 'completed') {
      toast({ title: "Ride Completed", description: `You have arrived at your destination. Thank you for using TriGo!` });
      // Reset routes and ETA, path
      setTriderToPickupRouteGeoJson(null);
      setPickupToDropoffRouteGeoJson(null);
      setCurrentSegmentETA(null);
      setCurrentTriderPath(null);
      setCurrentTriderPathIndex(0);
    }
  }, [rideState.status, toast]);


  // Simulate trider movement along the fetched path
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if ((rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && currentTriderPath && currentTriderPath.length > 0) {
      intervalId = setInterval(() => {
        setCurrentTriderPathIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < currentTriderPath.length) {
            setTriderSimLocation(currentTriderPath[nextIndex]);
            return nextIndex;
          } else { // Reached end of current path segment
            setTriderSimLocation(currentTriderPath[currentTriderPath.length - 1]); // Snap to last point
            
            if (rideState.status === 'triderAssigned' && rideState.pickupLocation && rideState.dropoffLocation && rideState.assignedTrider) {
              toast({ title: "Trider Arrived", description: `${rideState.assignedTrider.name} has arrived at your pickup location.` });
              setRideState(rs => ({ ...rs, status: 'inProgress' }));
              // Fetch route from pickup to dropoff
              fetchRouteAndPath(rideState.pickupLocation, rideState.dropoffLocation, 'toDropoff');
            } else if (rideState.status === 'inProgress') {
              // This status change will trigger the toast in the other useEffect
              setRideState(rs => ({ ...rs, status: 'completed' }));
            }
            return prevIndex; // Stop incrementing for this path by returning prevIndex
          }
        });
      }, 1500); // Adjusted interval for smoother visual movement (1.5 seconds per step)
    }
    return () => clearInterval(intervalId);
  }, [rideState.status, currentTriderPath, toast, rideState.pickupLocation, rideState.dropoffLocation, rideState.assignedTrider]); // fetchRouteAndPath is not in deps, it's stable.

  const handleMapClick = (event: mapboxgl.MapLayerMouseEvent) => {
    const { lngLat } = event;
    const newLocation = { longitude: lngLat.lng, latitude: lngLat.lat };

    if (rideState.status === 'idle' || rideState.status === 'selectingPickup') {
      setRideState(prev => ({ ...prev, status: 'selectingDropoff', pickupLocation: newLocation, pickupAddress: `Selected Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})` }));
      toast({ title: "Pickup Set", description: "Now select your dropoff location." });
    } else if (rideState.status === 'selectingDropoff' && rideState.pickupLocation) {
      const estimatedFare = calculateDistance(rideState.pickupLocation, newLocation) * 20 + 30; // Simple fare logic
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: `Selected Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`, estimatedFare }));
      fetchRouteAndPath(rideState.pickupLocation, newLocation, 'toDropoff'); // Show route for confirmation
      toast({ title: "Dropoff Set", description: "Confirm your ride details." });
    }
  };

  const fetchRouteAndPath = async (start: Coordinates, end: Coordinates, routeType: 'toPickup' | 'toDropoff') => {
    if (!MAPBOX_TOKEN) return;
    setCurrentTriderPath(null); // Clear previous path immediately
    setCurrentTriderPathIndex(0);

    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeGeometry = data.routes[0].geometry;
        const routeFeatureCollection = { type: 'FeatureCollection' as const, features: [{ type: 'Feature' as const, properties: {}, geometry: routeGeometry }] };
        const pathCoordinates = routeGeometry.coordinates.map((coord: [number, number]) => ({ longitude: coord[0], latitude: coord[1] }));

        if (routeType === 'toPickup') {
          setTriderToPickupRouteGeoJson(routeFeatureCollection);
          setPickupToDropoffRouteGeoJson(null); 
          setCurrentTriderPath(pathCoordinates);
          if (pathCoordinates.length > 0) setTriderSimLocation(pathCoordinates[0]);
        } else { // toDropoff (either for confirmation or actual travel)
          setPickupToDropoffRouteGeoJson(routeFeatureCollection);
          if (rideState.status === 'inProgress' || rideState.status === 'triderAssigned') { // TriderAssigned to show route from trider, InProgress to start moving on this path
             // When transitioning to 'inProgress', the trider-to-pickup route should be cleared
            setTriderToPickupRouteGeoJson(null);
            setCurrentTriderPath(pathCoordinates); // Set path for movement
            if (pathCoordinates.length > 0 && rideState.status === 'inProgress') { // If already inProgress, start trider at beginning of this path
                 setTriderSimLocation(pathCoordinates[0]);
            }
          } else if (rideState.status === 'confirmingRide') {
            // For confirmingRide, we only show the pickupToDropoffRoute, no trider movement on it yet.
            // No need to set currentTriderPath for movement here.
          }
        }
        
        const durationMinutes = Math.round(data.routes[0].duration / 60);
        setCurrentSegmentETA(`${durationMinutes} min`);
      } else {
        setCurrentSegmentETA(null);
        if (routeType === 'toPickup') setTriderToPickupRouteGeoJson(null);
        else setPickupToDropoffRouteGeoJson(null);
        setCurrentTriderPath(null);
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setCurrentSegmentETA(null);
      if (routeType === 'toPickup') setTriderToPickupRouteGeoJson(null);
      else setPickupToDropoffRouteGeoJson(null);
      setCurrentTriderPath(null);
    }
  };

  const handleRequestRide = () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation) {
      toast({ title: "Missing Locations", description: "Please select pickup and dropoff points.", variant: "destructive" });
      return;
    }
    setRideState(prev => ({ ...prev, status: 'searching', currentRideId: `ride-sim-${Date.now()}` }));
    setPickupToDropoffRouteGeoJson(null); // Clear confirmation route display
    setCurrentSegmentETA(null); // Clear ETA from confirmation
    toast({ title: "Searching for Trider...", description: "We're finding a TriGo for you." });

    setTimeout(() => {
      const randomTrider = mockTriders[Math.floor(Math.random() * mockTriders.length)];
      setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider: randomTrider }));
      setTriderSimLocation(randomTrider.location); 
      fetchRouteAndPath(randomTrider.location, rideState.pickupLocation!, 'toPickup'); 
      toast({ title: "Trider Found!", description: `${randomTrider.name} is on the way.` });
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState({
      status: 'idle',
      pickupLocation: null,
      dropoffLocation: null,
      pickupAddress: null,
      dropoffAddress: null,
      estimatedFare: null,
      assignedTrider: null,
      currentRideId: null,
    });
    setTriderSimLocation(null);
    setTriderToPickupRouteGeoJson(null);
    setPickupToDropoffRouteGeoJson(null);
    setCurrentSegmentETA(null);
    setCurrentTriderPath(null);
    setCurrentTriderPathIndex(0);
    toast({ title: "Ride Cancelled" });
  };
  
  const handleNewRide = () => {
    handleCancelRide(); // Resets everything
  }

  const triderToPickupRouteLayer: any = React.useMemo(() => ({
    id: 'route-trider-to-pickup',
    type: 'line',
    source: 'route-trider-to-pickup-source', // Ensure source ID is unique if data is different
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': resolvedAccentColor, 'line-width': 6, 'line-opacity': 0.75 },
  }), [resolvedAccentColor]);
  
  const pickupToDropoffRouteLayer: any = React.useMemo(() => ({
    id: 'route-pickup-to-dropoff',
    type: 'line',
    source: 'route-pickup-to-dropoff-source', // Ensure source ID is unique
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': resolvedPrimaryColor, 'line-width': 7, 'line-opacity': 0.9 },
  }), [resolvedPrimaryColor]);


  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><p>Loading Passenger Experience...</p></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <User className="mr-2" /> TriGo Passenger
        </h1>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 md:p-4 overflow-hidden">
        <div className="md:col-span-1 flex flex-col gap-4 p-4 md:p-0 h-full overflow-y-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {rideState.status === 'idle' && "Plan Your Ride"}
                {rideState.status === 'selectingPickup' && "Select Pickup Location"}
                {rideState.status === 'selectingDropoff' && "Select Dropoff Location"}
                {rideState.status === 'confirmingRide' && "Confirm Your Ride"}
                {rideState.status === 'searching' && "Finding Your TriGo..."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && "Ride In Progress"}
                {rideState.status === 'completed' && "Ride Completed!"}
                {rideState.status === 'cancelled' && "Ride Cancelled"}
              </CardTitle>
              <CardDescription>
                {rideState.status === 'idle' && "Tap on the map to set your pickup point."}
                {rideState.status === 'selectingPickup' && "Tap on the map to set your pickup point."}
                {rideState.status === 'selectingDropoff' && "Tap on the map to set your dropoff point."}
                {rideState.status === 'confirmingRide' && "Review details and request your ride."}
                {rideState.status === 'searching' && "Please wait while we connect you with a nearby trider."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && `Your trider ${rideState.assignedTrider.name} is ${rideState.status === 'triderAssigned' ? 'coming to pick you up.' : 'taking you to your destination.'}`}
                {rideState.status === 'completed' && "Hope you enjoyed your ride!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress' || rideState.status === 'completed') && (
                <div className="text-sm">
                  <div className="flex items-center">
                    <Dot className="text-green-500 -ml-1 mr-1" size={24}/>
                    <strong>Pickup:</strong> <span className="ml-1 truncate">{rideState.pickupAddress || "Not set"}</span>
                  </div>
                  {(rideState.status !== 'selectingDropoff') && ( // Show dropoff once it's set past the 'selectingDropoff' stage
                     <div className="flex items-center">
                       <MapPin className="text-red-500 mr-1.5 ml-0.5" size={16}/>
                       <strong>Dropoff:</strong> <span className="ml-1 truncate">{rideState.dropoffAddress || "Not set"}</span>
                     </div>
                  )}
                </div>
              )}

              {rideState.status === 'confirmingRide' && rideState.estimatedFare && (
                <Alert>
                  <CircleDollarSign className="h-4 w-4" />
                  <AlertTitle>Estimated Fare</AlertTitle>
                  <AlertDescription>
                    Around ₱{rideState.estimatedFare.toFixed(2)}. Actual fare may vary.
                    {currentSegmentETA && ` Estimated trip time: ${currentSegmentETA}.`}
                  </AlertDescription>
                </Alert>
              )}

              {rideState.status === 'searching' && (
                <div className="flex items-center justify-center py-4">
                  <Search className="h-8 w-8 animate-pulse text-primary" />
                  <p className="ml-2">Looking for available triders...</p>
                </div>
              )}

              {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                <Card className="bg-secondary/50 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {rideState.assignedTrider.profilePictureUrl && <AvatarImage src={rideState.assignedTrider.profilePictureUrl} data-ai-hint="driver portrait" />}
                      <AvatarFallback>{rideState.assignedTrider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{rideState.assignedTrider.name}</p>
                      <p className="text-xs text-muted-foreground">{rideState.assignedTrider.vehicleType} - {rideState.assignedTrider.todaZoneName}</p>
                      <p className="text-xs font-medium mt-0.5">Status: {rideState.status === 'triderAssigned' ? 'En Route to Pickup' : 'On Trip to Destination'}</p>
                    </div>
                  </div>
                  {currentSegmentETA && (
                    <div className="mt-2 pt-2 border-t border-muted flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary"/>
                        <p className="text-sm font-semibold">
                           {rideState.status === 'triderAssigned' ? 'Trider ETA to pickup: ' : 'ETA to destination: '}
                           {currentSegmentETA}
                        </p>
                    </div>
                  )}
                </Card>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {rideState.status === 'confirmingRide' && (
                <Button onClick={handleRequestRide} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Request TriGo Now</Button>
              )}
              {(rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
                <Button onClick={handleCancelRide} variant="outline" className="w-full">Cancel Ride</Button>
              )}
               {rideState.status === 'completed' && (
                <Button onClick={handleNewRide} className="w-full">Book Another Ride</Button>
              )}
               {(rideState.status === 'idle' || rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff') && (
                <Button onClick={handleCancelRide} variant="ghost" className="w-full">Reset Selection</Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12" // or your preferred style
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            {rideState.pickupLocation && (
              <Marker longitude={rideState.pickupLocation.longitude} latitude={rideState.pickupLocation.latitude} color="green">
                 <div title="Pickup" className="p-1 rounded-full bg-green-500 text-white shadow-md flex items-center justify-center">
                    <User size={18} />
                 </div>
              </Marker>
            )}
            {rideState.dropoffLocation && (
              <Marker longitude={rideState.dropoffLocation.longitude} latitude={rideState.dropoffLocation.latitude} color="red">
                 <div title="Dropoff" className="p-1 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center">
                    <MapPin size={18} />
                 </div>
              </Marker>
            )}
            {triderSimLocation && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
              <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude}>
                 <div className="p-1.5 rounded-full shadow-md bg-primary text-primary-foreground animate-pulse" title="Your Trider" data-ai-hint="tricycle rider">
                    <Bike size={20} />
                  </div>
              </Marker>
            )}
            
            {triderToPickupRouteGeoJson && (rideState.status === 'triderAssigned') && (
              <Source id="route-trider-to-pickup-source" type="geojson" data={triderToPickupRouteGeoJson}>
                <Layer {...triderToPickupRouteLayer} />
              </Source>
            )}
            {/* This layer shows route from pickup to dropoff, visible during confirmation and inProgress */}
            {pickupToDropoffRouteGeoJson && (rideState.status === 'confirmingRide' || rideState.status === 'inProgress') && (
              <Source id="route-pickup-to-dropoff-source" type="geojson" data={pickupToDropoffRouteGeoJson}>
                <Layer {...pickupToDropoffRouteLayer} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}

    