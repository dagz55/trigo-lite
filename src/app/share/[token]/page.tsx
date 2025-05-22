
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import type { Coordinates, RoutePath } from '@/types'; // Assuming RoutePath is defined
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Bike, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { todaZones } from '@/data/todaZones'; // For fallback center

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Mock ride data structure for the share page
interface SharedRideDetails {
  rideId: string;
  passengerName: string;
  triderName: string;
  triderBodyNumber: string;
  triderVehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  triderLocation: Coordinates;
  routeToPickup: RoutePath | null;
  routeToDropoff: RoutePath | null;
  currentLeg: 'toPickup' | 'toDropoff';
  estimatedArrivalTime: Date | null; // ETA for the current leg
  status: 'enRouteToPickup' | 'enRouteToDropoff' | 'completed' | 'cancelled' | 'unknown';
}

// Helper to get a random point within a larger area if needed
const getRandomLasPinasPoint = (): Coordinates => {
    // A rough bounding box for Las Piñas
    const minLat = 14.40;
    const maxLat = 14.48;
    const minLng = 120.95;
    const maxLng = 121.05;
    return {
        latitude: Math.random() * (maxLat - minLat) + minLat,
        longitude: Math.random() * (maxLng - minLng) + minLng,
    };
};

const FALLBACK_LAS_PINAS_CENTER: Coordinates = todaZones[0]?.center || { latitude: 14.4445, longitude: 120.9938 };


export default function ShareRidePage() {
  const params = useParams();
  const token = params.token as string;

  const [rideDetails, setRideDetails] = React.useState<SharedRideDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mapCenter, setMapCenter] = React.useState<Coordinates>(FALLBACK_LAS_PINAS_CENTER);

  const [routeColor, setRouteColor] = React.useState('hsl(var(--primary))'); // Default, will be updated

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const computedStyles = getComputedStyle(document.documentElement);
        const primaryColorVar = computedStyles.getPropertyValue('--primary').trim();
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
        setRouteColor(primaryColorVar ? parseHsl(primaryColorVar) : '#FF5722'); // Orange fallback
    }
  }, []);


  const fetchRideDetails = React.useCallback(async (rideToken: string) => {
    setIsLoading(true);
    setError(null);
    console.log(`Simulating fetching ride details for token: ${rideToken}`);
    // In a real app, this would be an API call to your backend/Supabase
    // For now, we'll mock it based on a hardcoded example if a specific token is used,
    // or generate random mock data.

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (rideToken === "DEMO_TOKEN_123" || rideToken === "mocktoken") { // Example specific token for testing
        const pickup = getRandomLasPinasPoint();
        const dropoff = getRandomLasPinasPoint();
        const triderLoc = getRandomLasPinasPoint();
        
        // Simulate fetching a simple route (straight line for mock)
        const mockRouteToPickup: RoutePath = { type: "LineString", coordinates: [[triderLoc.longitude, triderLoc.latitude], [pickup.longitude, pickup.latitude]] };
        const mockRouteToDropoff: RoutePath = { type: "LineString", coordinates: [[pickup.longitude, pickup.latitude], [dropoff.longitude, dropoff.latitude]] };
        
        const mockRide: SharedRideDetails = {
            rideId: "RIDE_" + rideToken.toUpperCase(),
            passengerName: "Shared User",
            triderName: "Mock Trider Dagz",
            triderBodyNumber: "007",
            triderVehicleType: "E-Bike",
            pickupAddress: "Mock Pickup Location, LP",
            dropoffAddress: "Mock Dropoff Location, LP",
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            triderLocation: triderLoc,
            routeToPickup: mockRouteToPickup,
            routeToDropoff: mockRouteToDropoff,
            currentLeg: Math.random() > 0.5 ? 'toPickup' : 'toDropoff',
            estimatedArrivalTime: new Date(Date.now() + (Math.floor(Math.random() * 15) + 5) * 60000), // 5-20 mins from now
            status: 'enRouteToPickup',
        };
        setRideDetails(mockRide);
        setMapCenter(mockRide.triderLocation); // Center map on trider
    } else if (rideToken) { // Generic mock for any other token
         const pickup = getRandomLasPinasPoint();
        const dropoff = getRandomLasPinasPoint();
        const triderLoc = getRandomLasPinasPoint();
        const mockRide: SharedRideDetails = {
            rideId: "RIDE_MOCK_" + rideToken.slice(0,4),
            passengerName: "Valued Friend",
            triderName: "Trider " + Math.floor(Math.random() * 100),
            triderBodyNumber: Math.floor(Math.random() * 900 + 100).toString(),
            triderVehicleType: Math.random() > 0.5 ? "Tricycle" : "E-Bike",
            pickupAddress: "Somewhere in Las Piñas",
            dropoffAddress: "Another place in Las Piñas",
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            triderLocation: triderLoc,
            routeToPickup: { type: "LineString", coordinates: [[triderLoc.longitude, triderLoc.latitude], [pickup.longitude, pickup.latitude]] },
            routeToDropoff: null, // Initially no route to dropoff
            currentLeg: 'toPickup',
            estimatedArrivalTime: new Date(Date.now() + (Math.floor(Math.random() * 15) + 5) * 60000),
            status: 'enRouteToPickup',
        };
        setRideDetails(mockRide);
        setMapCenter(mockRide.triderLocation);
    } else {
        setError("Invalid or expired share token.");
    }
    setIsLoading(false);
  }, []);


  React.useEffect(() => {
    if (token) {
      fetchRideDetails(token);

      // Simulate auto-refresh
      const intervalId = setInterval(() => {
        console.log(`Simulating refresh for ride data (token: ${token})...`);
        // In a real app with SWR or React Query, this would trigger a re-fetch
        // For mock, we can slightly adjust trider location or ETA
        setRideDetails(prev => {
          if (!prev) return null;
          const newTriderLat = prev.triderLocation.latitude + (Math.random() - 0.5) * 0.0005;
          const newTriderLng = prev.triderLocation.longitude + (Math.random() - 0.5) * 0.0005;
          const newETA = prev.estimatedArrivalTime ? new Date(prev.estimatedArrivalTime.getTime() - 5000) : null;

          let updatedStatus = prev.status;
          let updatedLeg = prev.currentLeg;
          let updatedRouteToPickup = prev.routeToPickup;
          let updatedRouteToDropoff = prev.routeToDropoff;

          // Simple mock state progression
          if (prev.status === 'enRouteToPickup' && Math.random() < 0.1) { // 10% chance to switch to next leg
            updatedStatus = 'enRouteToDropoff';
            updatedLeg = 'toDropoff';
            updatedRouteToPickup = null; // Clear previous leg route
            updatedRouteToDropoff = { type: "LineString", coordinates: [[prev.pickupLocation.longitude, prev.pickupLocation.latitude], [prev.dropoffLocation.longitude, prev.dropoffLocation.latitude]] };
            console.log("Mock: Trider arrived at pickup, now en route to dropoff.");
          } else if (prev.status === 'enRouteToDropoff' && Math.random() < 0.05) { // 5% chance to complete
            updatedStatus = 'completed';
            updatedRouteToDropoff = null;
            console.log("Mock: Ride completed.");
          }


          return {
            ...prev,
            triderLocation: { latitude: newTriderLat, longitude: newTriderLng },
            estimatedArrivalTime: newETA,
            status: updatedStatus,
            currentLeg: updatedLeg,
            routeToPickup: updatedRouteToPickup,
            routeToDropoff: updatedRouteToDropoff,
          };
        });
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(intervalId);
    } else {
      setError("No share token provided.");
      setIsLoading(false);
    }
  }, [token, fetchRideDetails]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading ride details...</p>
      </div>
    );
  }

  if (error || !rideDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive p-4">
        <MapPin className="h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">Unable to Load Ride</p>
        <p className="text-center">{error || "The share link may be invalid or expired."}</p>
        <Button variant="link" onClick={() => window.location.href = "/"} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  const currentRoute = rideDetails.currentLeg === 'toPickup' ? rideDetails.routeToPickup : rideDetails.routeToDropoff;
  const routeLayerConfig: any = {
    id: 'shared-ride-route', type: 'line', source: 'shared-ride-route-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': routeColor, 'line-width': 5, 'line-opacity': 0.8 },
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 bg-card border-b border-border shadow-sm">
        <h1 className="text-xl font-semibold text-primary flex items-center">
          <MapPin className="mr-2 h-6 w-6" /> TriGo Ride Share
        </h1> 
        <p className="text-xs text-muted-foreground">Ticket ID: {rideDetails.rideId}</p>
      </header>

      <div className="relative flex-grow">
        {MAPBOX_TOKEN ? (
          <Map
            initialViewState={{
              longitude: mapCenter.longitude,
              latitude: mapCenter.latitude,
              zoom: 14,
              pitch: 30,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11" // Using dark style for share page
            mapboxAccessToken={MAPBOX_TOKEN}
            attributionControl={false}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={rideDetails.triderLocation.longitude} latitude={rideDetails.triderLocation.latitude} anchor="bottom">
              <div className="p-1.5 rounded-full shadow-md bg-primary text-primary-foreground animate-pulse">
                <Bike size={20} />
              </div>
            </Marker>
            <Marker longitude={rideDetails.pickupLocation.longitude} latitude={rideDetails.pickupLocation.latitude} anchor="bottom">
              <MapPin size={28} className="text-green-400" fill="currentColor" />
            </Marker>
            <Marker longitude={rideDetails.dropoffLocation.longitude} latitude={rideDetails.dropoffLocation.latitude} anchor="bottom">
              <MapPin size={28} className="text-red-400" fill="currentColor" />
            </Marker>

            {currentRoute && (
              <Source id="shared-ride-route-source" type="geojson" data={{ type: 'Feature', geometry: currentRoute, properties: {} }}>
                <Layer {...routeLayerConfig} />
              </Source>
            )}
          </Map>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground">
            Map preview unavailable: Mapbox token missing.
          </div>
        )}
      </div>

      <footer className="p-4 bg-card border-t border-border shadow-sm">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              {rideDetails.status === 'enRouteToPickup' ? "Trider En Route to Pickup" :
               rideDetails.status === 'enRouteToDropoff' ? "Ride In Progress to Destination" :
               rideDetails.status === 'completed' ? "Ride Completed" :
               rideDetails.status === 'cancelled' ? "Ride Cancelled" :
               "Tracking Ride..."}
            </CardTitle>
          </CardHeader>
 <CardContent className="text-sm space-y-1">
 {/* Simple message indicating this is the shared view */}
 <p className="text-xs text-yellow-500 italic mb-2">You are viewing a shared ride in read-only mode.</p>
            <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> Trider: {rideDetails.triderName} (#{rideDetails.triderBodyNumber}) - {rideDetails.triderVehicleType}</p>
            <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-green-400" /> From: {rideDetails.pickupAddress}</p>
            <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-red-400" /> To: {rideDetails.dropoffAddress}</p>
            {rideDetails.estimatedArrivalTime && rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
              <p className="flex items-center font-semibold text-primary"><Clock className="mr-2 h-4 w-4" /> ETA: {format(rideDetails.estimatedArrivalTime, "HH:mm aa")}</p>
            )}
            {rideDetails.status === 'completed' && <p className="text-green-500 font-semibold">Arrived at destination.</p>}
            {rideDetails.status === 'cancelled' && <p className="text-red-500 font-semibold">This ride has been cancelled.</p>}
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}

// Styles can be added here or in globals.css if needed.
// For example, if using Tailwind JIT and need dynamic classes not picked up.
// <style jsx global>{`
// `}</style>
