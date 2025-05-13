
"use client";

import * as React from 'react';
import { MapboxMap } from '@/components/map/MapboxMap';
import { TriderList } from '@/components/dispatch/TriderList';
import { RideRequestList } from '@/components/dispatch/RideRequestList';
import { AiInsights } from '@/components/dispatch/AiInsights';
import type { Trider, RideRequest, AiInsight, Coordinates } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, RouteIcon } from 'lucide-react';

// Las Piñas City, Philippines Coordinates
const LAS_PINAS_CENTER: Coordinates = { latitude: 14.4445, longitude: 120.9938 };
const LAT_OFFSET = 0.05; // Approx 5.5 km
const LNG_OFFSET = 0.05; // Approx 5.5 km

// Mock Data around Las Piñas
const initialTriders: Trider[] = [
  { id: 'trider-1', name: 'Juan Dela Cruz', location: { latitude: LAS_PINAS_CENTER.latitude + (Math.random() - 0.5) * 0.02, longitude: LAS_PINAS_CENTER.longitude + (Math.random() - 0.5) * 0.02 }, status: 'available', vehicleType: 'Tricycle' },
  { id: 'trider-2', name: 'Maria Clara', location: { latitude: LAS_PINAS_CENTER.latitude - (Math.random() - 0.5) * 0.02, longitude: LAS_PINAS_CENTER.longitude - (Math.random() - 0.5) * 0.02 }, status: 'busy', vehicleType: 'E-Bike' },
  { id: 'trider-3', name: 'Crisostomo Ibarra', location: { latitude: LAS_PINAS_CENTER.latitude + (Math.random() - 0.5) * 0.01, longitude: LAS_PINAS_CENTER.longitude - (Math.random() - 0.5) * 0.01 }, status: 'offline', vehicleType: 'Tricycle' },
  { id: 'trider-4', name: 'Sisa K.', location: { latitude: LAS_PINAS_CENTER.latitude - (Math.random() - 0.5) * 0.01, longitude: LAS_PINAS_CENTER.longitude + (Math.random() - 0.5) * 0.01 }, status: 'available', vehicleType: 'Tricycle' },
];

const initialRideRequests: RideRequest[] = [
  { 
    id: 'ride-1', 
    passengerName: 'John Doe', 
    pickupLocation: { latitude: LAS_PINAS_CENTER.latitude + 0.01, longitude: LAS_PINAS_CENTER.longitude - 0.01 }, 
    dropoffLocation: { latitude: LAS_PINAS_CENTER.latitude - 0.01, longitude: LAS_PINAS_CENTER.longitude + 0.01 }, 
    pickupAddress: 'Alabang-Zapote Road, Las Piñas', 
    dropoffAddress: 'SM Southmall, Las Piñas', 
    status: 'pending', 
    fare: 75.50, 
    requestedAt: new Date(Date.now() - 5 * 60 * 1000) 
  },
  { 
    id: 'ride-2', 
    passengerName: 'Jane Smith', 
    pickupLocation: { latitude: LAS_PINAS_CENTER.latitude - 0.005, longitude: LAS_PINAS_CENTER.longitude + 0.005 }, 
    dropoffLocation: { latitude: LAS_PINAS_CENTER.latitude + 0.005, longitude: LAS_PINAS_CENTER.longitude - 0.005 }, 
    pickupAddress: 'Pilar Village, Las Piñas', 
    dropoffAddress: 'BF Resort Village, Las Piñas', 
    status: 'assigned', 
    assignedTriderId: 'trider-2', 
    fare: 60.00, 
    requestedAt: new Date(Date.now() - 10 * 60 * 1000) 
  },
];

const initialAiInsights: AiInsight[] = [
  { id: 'ai-1', title: 'High Demand Alert', description: 'Increased ride requests near Zapote area. Consider deploying more triders.', severity: 'warning', timestamp: new Date(Date.now() - 2 * 60 * 1000), relatedLocation: { latitude: LAS_PINAS_CENTER.latitude + 0.02, longitude: LAS_PINAS_CENTER.longitude - 0.02 } },
  { id: 'ai-2', title: 'Route Optimization Available', description: 'Trider Juan Dela Cruz can take a faster route via Friendship Route.', severity: 'info', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
];


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function DispatchPage() {
  const [triders, setTriders] = React.useState<Trider[]>(initialTriders);
  const [rideRequests, setRideRequests] = React.useState<RideRequest[]>(initialRideRequests);
  const [aiInsights, setAiInsights] = React.useState<AiInsight[]>(initialAiInsights);

  const [selectedTrider, setSelectedTrider] = React.useState<Trider | null>(null);
  const [selectedRideRequest, setSelectedRideRequest] = React.useState<RideRequest | null>(null);
  
  const [routeGeoJson, setRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [heatmapData, setHeatmapData] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = React.useState(false);

  const { toast } = useToast();

  // Simulate real-time trider location updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline') return trider;
          // Simulate movement for busy/assigned triders
          if (trider.status === 'busy' || trider.status === 'assigned') {
            // Find associated ride if any
            const ride = rideRequests.find(r => r.assignedTriderId === trider.id && (r.status === 'assigned' || r.status === 'in-progress'));
            if (ride) {
              // Simple mock: move slightly towards drop-off
              const targetLat = ride.dropoffLocation.latitude;
              const targetLon = ride.dropoffLocation.longitude;
              return {
                ...trider,
                location: {
                  latitude: trider.location.latitude + (targetLat - trider.location.latitude) * 0.05 + (Math.random() - 0.5) * 0.0005,
                  longitude: trider.location.longitude + (targetLon - trider.location.longitude) * 0.05 + (Math.random() - 0.5) * 0.0005,
                },
              };
            }
          }
          // Random movement for available triders
          return {
            ...trider,
            location: {
              latitude: trider.location.latitude + (Math.random() - 0.5) * 0.001,
              longitude: trider.location.longitude + (Math.random() - 0.5) * 0.001,
            },
          };
        })
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [rideRequests]);

  // Simulate new ride requests and AI insights
  React.useEffect(() => {
    const rideInterval = setInterval(() => {
      const newRideId = `ride-${Date.now()}`;
      const newRide: RideRequest = {
        id: newRideId,
        passengerName: `Passenger ${Math.floor(Math.random() * 1000)}`,
        pickupLocation: { 
          latitude: LAS_PINAS_CENTER.latitude + (Math.random() - 0.5) * LAT_OFFSET, 
          longitude: LAS_PINAS_CENTER.longitude + (Math.random() - 0.5) * LNG_OFFSET 
        },
        dropoffLocation: { 
          latitude: LAS_PINAS_CENTER.latitude + (Math.random() - 0.5) * LAT_OFFSET, 
          longitude: LAS_PINAS_CENTER.longitude + (Math.random() - 0.5) * LNG_OFFSET
        },
        status: 'pending',
        requestedAt: new Date(),
      };
      setRideRequests(prev => [newRide, ...prev.slice(0,19)]); // Keep max 20 requests
      toast({ title: "New Ride Request", description: `${newRide.passengerName} needs a ride.` });
    }, 30000); // New ride every 30 seconds

    const insightInterval = setInterval(() => {
      const newInsightId = `ai-${Date.now()}`;
      const newInsight: AiInsight = {
        id: newInsightId,
        title: `Dynamic Pricing Update`,
        description: `Demand surge near Perpetual Help Medical Center. Fares increased by 1.2x.`,
        severity: 'info',
        timestamp: new Date(),
      };
      setAiInsights(prev => [newInsight, ...prev.slice(0,4)]); // Keep max 5 insights
    }, 60000); // New insight every 60 seconds

    return () => {
      clearInterval(rideInterval);
      clearInterval(insightInterval);
    };
  }, [toast]);

  // Generate heatmap data from ride requests
  React.useEffect(() => {
    const features = rideRequests.map(req => ({
      type: 'Feature' as const,
      properties: { mag: Math.random() * 5 + 1 }, // Mock magnitude for heatmap intensity
      geometry: {
        type: 'Point' as const,
        coordinates: [req.pickupLocation.longitude, req.pickupLocation.latitude]
      }
    }));
    setHeatmapData({ type: 'FeatureCollection', features });
  }, [rideRequests]);


  const handleSelectTrider = (trider: Trider | null) => {
    setSelectedTrider(trider);
    if (trider && selectedRideRequest) {
      fetchRoute(trider.location, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);
    } else {
      setRouteGeoJson(null); // Clear route if trider or request is deselected
    }
  };
  
  const handleSelectRideRequest = (request: RideRequest | null) => {
    setSelectedRideRequest(request);
     if (request && selectedTrider) {
      fetchRoute(selectedTrider.location, request.pickupLocation, request.dropoffLocation);
    } else if (request) {
      // If only request is selected, maybe show its pickup/dropoff, or wait for trider
      setRouteGeoJson(null);
    }
     else {
      setRouteGeoJson(null); // Clear route if request is deselected
    }
  };

  const fetchRoute = async (start: Coordinates, pickup: Coordinates, dropoff: Coordinates) => {
    if (!MAPBOX_TOKEN) {
      toast({ title: "Map Error", description: "Mapbox token is missing.", variant: "destructive" });
      return;
    }
    setIsFetchingRoute(true);
    // Format: {longitude},{latitude};{longitude},{latitude};{longitude},{latitude}
    const coordinatesString = `${start.longitude},${start.latitude};${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        setRouteGeoJson({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: route }]
        });
        const durationMinutes = Math.round(data.routes[0].duration / 60);
        const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
        toast({ title: "Route Calculated", description: `ETA: ${durationMinutes} mins, Distance: ${distanceKm} km.` });
      } else {
        toast({ title: "Route Error", description: data.message || "Could not calculate route.", variant: "destructive" });
        setRouteGeoJson(null);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({ title: "Route Error", description: "Failed to fetch route.", variant: "destructive" });
      setRouteGeoJson(null);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleDispatchRide = () => {
    if (!selectedTrider || !selectedRideRequest) {
      toast({ title: "Dispatch Error", description: "Please select an available trider and a pending ride request.", variant: "destructive" });
      return;
    }
    if (selectedTrider.status !== 'available') {
      toast({ title: "Dispatch Error", description: `Trider ${selectedTrider.name} is not available.`, variant: "destructive" });
      return;
    }
    if (selectedRideRequest.status !== 'pending') {
      toast({ title: "Dispatch Error", description: `Ride request for ${selectedRideRequest.passengerName} is not pending.`, variant: "destructive" });
      return;
    }

    // Update trider status
    setTriders(prev => prev.map(t => t.id === selectedTrider.id ? { ...t, status: 'assigned' } : t));
    // Update ride request status
    setRideRequests(prev => prev.map(r => r.id === selectedRideRequest.id ? { ...r, status: 'assigned', assignedTriderId: selectedTrider.id } : r));
    
    toast({ title: "Ride Dispatched!", description: `${selectedTrider.name} assigned to ${selectedRideRequest.passengerName}.` });
    
    // Fetch route for dispatched ride
    fetchRoute(selectedTrider.location, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);

    // Optionally, clear selections after dispatch
    // setSelectedTrider(null);
    // setSelectedRideRequest(null);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,0px))] md:h-screen"> {/* Adjust height based on potential header */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Left Panel: Lists and Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto h-full max-h-[calc(100vh-2rem)] lg:max-h-full">
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Dispatch Control</CardTitle>
              <CardDescription>Select a ride and an available trider to dispatch.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRideRequest && <p className="text-sm mb-1">Ride: <span className="font-medium">{selectedRideRequest.passengerName}</span></p>}
              {selectedTrider && <p className="text-sm mb-2">Trider: <span className="font-medium">{selectedTrider.name}</span> ({selectedTrider.status})</p>}
              {!selectedRideRequest && !selectedTrider && <p className="text-sm text-muted-foreground">No ride or trider selected.</p>}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleDispatchRide} 
                disabled={!selectedTrider || !selectedRideRequest || selectedTrider.status !== 'available' || selectedRideRequest.status !== 'pending' || isFetchingRoute}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isFetchingRoute && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dispatch Ride
              </Button>
            </CardFooter>
          </Card>

          <div className="flex-grow min-h-[200px]">
            <TriderList 
              triders={triders} 
              selectedTriderId={selectedTrider?.id || null}
              onSelectTrider={handleSelectTrider} 
            />
          </div>
          <div className="flex-grow min-h-[200px]">
            <RideRequestList 
              rideRequests={rideRequests} 
              selectedRideRequestId={selectedRideRequest?.id || null}
              onSelectRideRequest={handleSelectRideRequest}
            />
          </div>
          <div className="flex-grow min-h-[150px]">
             <AiInsights insights={aiInsights} />
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 h-full min-h-[400px] lg:min-h-0 rounded-lg overflow-hidden shadow-lg border">
          <MapboxMap
            initialViewState={{ // Pass initial view state to center on Las Piñas
              longitude: LAS_PINAS_CENTER.longitude,
              latitude: LAS_PINAS_CENTER.latitude,
              zoom: 13, // Adjusted zoom for a city view
            }}
            triders={triders}
            rideRequests={rideRequests}
            selectedTrider={selectedTrider}
            onSelectTrider={handleSelectTrider}
            selectedRideRequest={selectedRideRequest}
            onSelectRideRequest={handleSelectRideRequest}
            routeGeoJson={routeGeoJson}
            heatmapData={heatmapData}
          />
        </div>
      </div>
    </div>
  );
}

