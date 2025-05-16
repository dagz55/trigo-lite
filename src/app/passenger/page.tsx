
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

// Mock Triders for demo
const mockTriders: TriderProfile[] = appTodaZones.slice(0, 5).map((zone, index) => ({
  id: `trider-sim-${index + 1}`,
  name: `Trider ${String.fromCharCode(65 + index)}`, // Trider A, Trider B, etc.
  location: getRandomPointInCircle(zone.center, zone.radiusKm * 0.5),
  status: 'available',
  vehicleType: 'Tricycle',
  todaZoneId: zone.id,
  todaZoneName: zone.name,
  profilePictureUrl: `https://placehold.co/100x100.png?text=T${String.fromCharCode(65 + index)}`,
  wallet: { currentBalance: 100, totalEarnedAllTime: 500, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
}));


export default function PassengerPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();

  const [viewState, setViewState] = React.useState({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom + 1, // Zoom in a bit more for passenger view
    pitch: 30,
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
  const [mapRouteGeoJson, setMapRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [estimatedETA, setEstimatedETA] = React.useState<string | null>(null);


  // Update map view when settings load or change
  React.useEffect(() => {
    if (!settingsLoading) {
      setViewState(prev => ({
        ...prev,
        longitude: defaultMapCenter.longitude,
        latitude: defaultMapCenter.latitude,
        zoom: defaultMapZoom + 1,
      }));
    }
  }, [defaultMapCenter, defaultMapZoom, settingsLoading]);

  // Simulate trider movement when assigned
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (rideState.status === 'triderAssigned' && rideState.assignedTrider && rideState.pickupLocation) {
      // Trider is moving to pickup. `triderSimLocation` is already set. Route is fetched in `handleRequestRide`.
      intervalId = setInterval(() => {
        setTriderSimLocation(prevLoc => {
          if (!prevLoc || !rideState.pickupLocation || !rideState.assignedTrider) return prevLoc;
          if (calculateDistance(prevLoc, rideState.pickupLocation) < 0.05) { // Arrived at pickup
            setRideState(rs => ({ ...rs, status: 'inProgress' }));
            toast({ title: "Trider Arrived", description: `${rideState.assignedTrider?.name} has arrived at your pickup location.` });
            // Now simulate moving to dropoff & fetch route
            if(rideState.dropoffLocation) fetchRoute(rideState.pickupLocation!, rideState.dropoffLocation!);
            return rideState.pickupLocation;
          }
          const newLat = prevLoc.latitude + (rideState.pickupLocation.latitude - prevLoc.latitude) * 0.2;
          const newLng = prevLoc.longitude + (rideState.pickupLocation.longitude - prevLoc.longitude) * 0.2;
          const newTriderLocation = { latitude: newLat, longitude: newLng };
          // Update route from new triderSimLocation to pickup
          fetchRoute(newTriderLocation, rideState.pickupLocation);
          return newTriderLocation;
        });
      }, 2000);
    } else if (rideState.status === 'inProgress' && triderSimLocation && rideState.dropoffLocation) {
        // Trider is moving towards dropoff
        intervalId = setInterval(() => {
        setTriderSimLocation(prevLoc => {
          if (!prevLoc || !rideState.dropoffLocation) return prevLoc;
          if (calculateDistance(prevLoc, rideState.dropoffLocation) < 0.05) { // Arrived at dropoff
            setRideState(rs => ({ ...rs, status: 'completed' }));
            toast({ title: "Ride Completed", description: `You have arrived at your destination. Thank you for using TriGo!` });
            setMapRouteGeoJson(null);
            setEstimatedETA(null);
            return rideState.dropoffLocation;
          }
          const newLat = prevLoc.latitude + (rideState.dropoffLocation.latitude - prevLoc.latitude) * 0.2;
          const newLng = prevLoc.longitude + (rideState.dropoffLocation.longitude - prevLoc.longitude) * 0.2;
          const newTriderLocation = {latitude: newLat, longitude: newLng};
          // Update route from new triderSimLocation to dropoff
          fetchRoute(newTriderLocation, rideState.dropoffLocation);
          return newTriderLocation;
        });
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [rideState.status, rideState.assignedTrider, rideState.pickupLocation, rideState.dropoffLocation, toast]);


  const handleMapClick = (event: mapboxgl.MapLayerMouseEvent) => {
    const { lngLat } = event;
    const newLocation = { longitude: lngLat.lng, latitude: lngLat.lat };

    if (rideState.status === 'idle' || rideState.status === 'selectingPickup') {
      setRideState(prev => ({ ...prev, status: 'selectingDropoff', pickupLocation: newLocation, pickupAddress: `Selected Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})` }));
      toast({ title: "Pickup Set", description: "Now select your dropoff location." });
    } else if (rideState.status === 'selectingDropoff') {
      const estimatedFare = calculateDistance(rideState.pickupLocation!, newLocation) * 20 + 30; // Mock fare calculation
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: `Selected Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`, estimatedFare }));
      if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation);
      toast({ title: "Dropoff Set", description: "Confirm your ride details." });
    }
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
        const durationMinutes = Math.round(data.routes[0].duration / 60);
        setEstimatedETA(`${durationMinutes} min`);
      } else {
        setEstimatedETA(null);
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setEstimatedETA(null);
    }
  };


  const handleRequestRide = () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation) {
      toast({ title: "Missing Locations", description: "Please select pickup and dropoff points.", variant: "destructive" });
      return;
    }
    setRideState(prev => ({ ...prev, status: 'searching', currentRideId: `ride-sim-${Date.now()}` }));
    toast({ title: "Searching for Trider...", description: "We're finding a TriGo for you." });

    // Simulate finding a trider
    setTimeout(() => {
      const randomTrider = mockTriders[Math.floor(Math.random() * mockTriders.length)];
      setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider: randomTrider }));
      setTriderSimLocation(randomTrider.location); // Set initial trider location for simulation
      if(rideState.pickupLocation) fetchRoute(randomTrider.location, rideState.pickupLocation); // Fetch route from trider to pickup
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
    setMapRouteGeoJson(null);
    setEstimatedETA(null);
    toast({ title: "Ride Cancelled" });
  };
  
  const handleNewRide = () => {
    handleCancelRide(); // Resets state
  }

  const routeLayer: any = {
    id: 'route-passenger',
    type: 'line',
    source: 'route-passenger',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': 'hsl(var(--primary))', 'line-width': 5, 'line-opacity': 0.8 },
  };

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
        {/* Control Panel */}
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
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && `Your trider ${rideState.assignedTrider?.name} is on the way.`}
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
                  {(rideState.status !== 'selectingDropoff') && (
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
                      {rideState.assignedTrider.profilePictureUrl && <AvatarImage src={rideState.assignedTrider.profilePictureUrl} data-ai-hint="driver portrait"/>}
                      <AvatarFallback>{rideState.assignedTrider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{rideState.assignedTrider.name}</p>
                      <p className="text-xs text-muted-foreground">{rideState.assignedTrider.vehicleType} - {rideState.assignedTrider.todaZoneName}</p>
                      <p className="text-xs font-medium mt-0.5">Status: {rideState.status === 'triderAssigned' ? 'En Route to Pickup' : 'On Trip to Destination'}</p>
                    </div>
                  </div>
                  {estimatedETA && (
                    <div className="mt-2 pt-2 border-t border-muted flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary"/>
                        <p className="text-sm font-semibold">Estimated Arrival: {estimatedETA}</p>
                    </div>
                  )}
                </Card>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {rideState.status === 'confirmingRide' && (
                <Button onClick={handleRequestRide} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Request TriGo Now</Button>
              )}
              {(rideState.status === 'searching' || rideState.status === 'triderAssigned') && (
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

        {/* Map View */}
        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
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
            {mapRouteGeoJson && (
              <Source id="route-passenger" type="geojson" data={mapRouteGeoJson}>
                {/* @ts-ignore */}
                <Layer {...routeLayer} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}

    