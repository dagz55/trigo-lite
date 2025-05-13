
"use client";

import * as React from 'react';
import { MapboxMap } from '@/components/map/MapboxMap';
import { TriderList } from '@/components/dispatch/TriderList';
import { RideRequestList } from '@/components/dispatch/RideRequestList';
import { AiInsights } from '@/components/dispatch/AiInsights';
import type { Trider, RideRequest, AiInsight, Coordinates, TodaZone } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { isPointInCircle, getRandomPointInCircle } from '@/lib/geoUtils';

// Las Piñas City, Philippines Coordinates
const LAS_PINAS_CENTER: Coordinates = { latitude: 14.4445, longitude: 120.9938 };

const initialTridersData: Omit<Trider, 'todaZoneName'>[] = [
  { id: 'trider-1', name: 'Juan Dela Cruz', location: { latitude: 14.440300, longitude: 121.000600 }, status: 'available', vehicleType: 'Tricycle', todaZoneId: '1' }, // ACAPODA
  { id: 'trider-2', name: 'Maria Clara', location: { latitude: 14.416700, longitude: 121.008200 }, status: 'available', vehicleType: 'E-Bike', todaZoneId: '3' }, // ATODA
  { id: 'trider-3', name: 'Crisostomo Ibarra', location: { latitude: 14.432500, longitude: 121.005000 }, status: 'offline', vehicleType: 'Tricycle', todaZoneId: '5' }, // BFRSSCV
  { id: 'trider-4', name: 'Sisa K.', location: { latitude: 14.403000, longitude: 121.012000 }, status: 'available', vehicleType: 'Tricycle', todaZoneId: '10' }, // MAMTTODA
  { id: 'trider-5', name: 'Elias P.', location: { latitude: 14.447800, longitude: 120.977100 }, status: 'available', vehicleType: 'Tricycle', todaZoneId: '13' }, // PVTODA
];

const initialTriders: Trider[] = initialTridersData.map(t => {
  const zone = appTodaZones.find(z => z.id === t.todaZoneId);
  return { ...t, todaZoneName: zone?.name || 'Unknown Zone' };
});


const initialRideRequests: RideRequest[] = [
  { 
    id: 'ride-1', 
    passengerName: 'John Doe', 
    pickupLocation: { latitude: 14.439300, longitude: 121.001600 }, // Near ACAPODA
    dropoffLocation: { latitude: LAS_PINAS_CENTER.latitude - 0.01, longitude: LAS_PINAS_CENTER.longitude + 0.01 }, 
    pickupAddress: 'Admiral Village, Talon Tres', 
    dropoffAddress: 'SM Southmall, Las Piñas', 
    status: 'pending', 
    fare: 75.50, 
    requestedAt: new Date(Date.now() - 5 * 60 * 1000) 
  },
  { 
    id: 'ride-2', 
    passengerName: 'Jane Smith', 
    pickupLocation: { latitude: 14.415700, longitude: 121.007200 }, // Near ATODA
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
  { id: 'ai-1', title: 'High Demand Alert', description: 'Increased ride requests near Zapote area. Consider deploying more triders from GGTODA.', severity: 'warning', timestamp: new Date(Date.now() - 2 * 60 * 1000), relatedLocation: { latitude: 14.442000, longitude: 120.995000 } },
  { id: 'ai-2', title: 'Route Optimization Available', description: 'Trider Juan Dela Cruz can take a faster route via Friendship Route.', severity: 'info', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
];


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function DispatchPage() {
  const [triders, setTriders] = React.useState<Trider[]>(initialTriders);
  const [rideRequests, setRideRequests] = React.useState<RideRequest[]>(initialRideRequests);
  const [aiInsights, setAiInsights] = React.useState<AiInsight[]>(initialAiInsights);
  const [todaZones] = React.useState<TodaZone[]>(appTodaZones);

  const [selectedTrider, setSelectedTrider] = React.useState<Trider | null>(null);
  const [selectedRideRequest, setSelectedRideRequest] = React.useState<RideRequest | null>(null);
  
  const [routeGeoJson, setRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [heatmapData, setHeatmapData] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = React.useState(false);
  const [candidateTriders, setCandidateTriders] = React.useState<Trider[]>(initialTriders.filter(t => t.status === 'available'));


  const { toast } = useToast();

  const getTodaZoneForLocation = React.useCallback((location: Coordinates): TodaZone | null => {
    for (const zone of todaZones) {
      if (isPointInCircle(location, zone.center, zone.radiusKm)) {
        return zone;
      }
    }
    return null;
  }, [todaZones]);

  React.useEffect(() => {
    // Initialize pickupTodaZoneId for existing requests
    setRideRequests(prevRequests => 
      prevRequests.map(req => {
        if (!req.pickupTodaZoneId) {
          const zone = getTodaZoneForLocation(req.pickupLocation);
          return { ...req, pickupTodaZoneId: zone?.id || null };
        }
        return req;
      })
    );
  }, [getTodaZoneForLocation, initialRideRequests]);


  // Simulate real-time trider location updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline') return trider;

          let newLocation = { ...trider.location };

          if (trider.status === 'assigned' || trider.status === 'busy') {
            const ride = rideRequests.find(r => r.assignedTriderId === trider.id && (r.status === 'assigned' || r.status === 'in-progress'));
            if (ride) {
              const targetLat = ride.status === 'assigned' ? ride.pickupLocation.latitude : ride.dropoffLocation.latitude;
              const targetLon = ride.status === 'assigned' ? ride.pickupLocation.longitude : ride.dropoffLocation.longitude;
              newLocation = {
                latitude: trider.location.latitude + (targetLat - trider.location.latitude) * 0.1 + (Math.random() - 0.5) * 0.0002,
                longitude: trider.location.longitude + (targetLon - trider.location.longitude) * 0.1 + (Math.random() - 0.5) * 0.0002,
              };
            } else { // Busy but no specific ride, random move within zone
                const triderZone = todaZones.find(z => z.id === trider.todaZoneId);
                if (triderZone) {
                    let attempts = 0;
                    let potentialLocation: Coordinates;
                    do {
                        potentialLocation = {
                            latitude: trider.location.latitude + (Math.random() - 0.5) * 0.001,
                            longitude: trider.location.longitude + (Math.random() - 0.5) * 0.001,
                        };
                        attempts++;
                    } while (!isPointInCircle(potentialLocation, triderZone.center, triderZone.radiusKm) && attempts < 5);
                     if(isPointInCircle(potentialLocation, triderZone.center, triderZone.radiusKm)) newLocation = potentialLocation;
                } // else keep current location if zone not found or attempts fail
            }
          } else if (trider.status === 'available') {
            // For available triders, try to move them within their zone or towards its center
            const triderZone = todaZones.find(z => z.id === trider.todaZoneId);
            if (triderZone) {
              if (!isPointInCircle(trider.location, triderZone.center, triderZone.radiusKm * 1.1)) { // If strayed
                // Move towards center
                newLocation = {
                  latitude: trider.location.latitude + (triderZone.center.latitude - trider.location.latitude) * 0.1,
                  longitude: trider.location.longitude + (triderZone.center.longitude - trider.location.longitude) * 0.1,
                };
              } else {
                // Random move, try to stay within zone
                let attempts = 0;
                let potentialLocation: Coordinates;
                 do {
                    potentialLocation = {
                        latitude: trider.location.latitude + (Math.random() - 0.5) * 0.001,
                        longitude: trider.location.longitude + (Math.random() - 0.5) * 0.001,
                    };
                    attempts++;
                } while (!isPointInCircle(potentialLocation, triderZone.center, triderZone.radiusKm) && attempts < 5);
                if(isPointInCircle(potentialLocation, triderZone.center, triderZone.radiusKm)) newLocation = potentialLocation;
              }
            }
          }
          return { ...trider, location: newLocation };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [rideRequests, todaZones]);


  // Simulate new ride requests and AI insights
  React.useEffect(() => {
    const rideInterval = setInterval(() => {
      if (todaZones.length === 0) return;

      const randomZone = todaZones[Math.floor(Math.random() * todaZones.length)];
      const pickupLocation = getRandomPointInCircle(randomZone.center, randomZone.radiusKm * 0.9); // 0.9 to be well within
      
      let dropoffLocation: Coordinates;
      let dropoffZone: TodaZone | null = null;
      do {
          const randomDropoffZone = todaZones[Math.floor(Math.random() * todaZones.length)];
          dropoffLocation = getRandomPointInCircle(randomDropoffZone.center, randomDropoffZone.radiusKm * 0.9);
          dropoffZone = getTodaZoneForLocation(dropoffLocation);
      } while (!dropoffZone) // Ensure dropoff is also in a zone for simplicity


      const newRideId = `ride-${Date.now()}`;
      const newRide: RideRequest = {
        id: newRideId,
        passengerName: `Passenger ${Math.floor(Math.random() * 1000)}`,
        pickupLocation,
        dropoffLocation,
        pickupAddress: `${randomZone.areaOfOperation} area`,
        dropoffAddress: `${dropoffZone?.areaOfOperation || 'Unknown'} area`,
        status: 'pending',
        requestedAt: new Date(),
        pickupTodaZoneId: randomZone.id,
        fare: Math.floor(Math.random() * 100) + 50,
      };
      setRideRequests(prev => [newRide, ...prev.slice(0,19)]);
      toast({ title: "New Ride Request", description: `${newRide.passengerName} in ${randomZone.name} needs a ride.` });
    }, 30000);

    const insightInterval = setInterval(() => {
      const newInsightId = `ai-${Date.now()}`;
      const randomZone = todaZones.length > 0 ? todaZones[Math.floor(Math.random() * todaZones.length)] : null;
      const newInsight: AiInsight = {
        id: newInsightId,
        title: `Dynamic Pricing Update`,
        description: `Demand surge near ${randomZone?.name || 'a busy area'}. Fares increased by 1.2x.`,
        severity: 'info',
        timestamp: new Date(),
        relatedLocation: randomZone?.center
      };
      setAiInsights(prev => [newInsight, ...prev.slice(0,4)]);
    }, 60000);

    return () => {
      clearInterval(rideInterval);
      clearInterval(insightInterval);
    };
  }, [toast, todaZones, getTodaZoneForLocation]);

  React.useEffect(() => {
    const features = rideRequests.map(req => ({
      type: 'Feature' as const,
      properties: { mag: Math.random() * 5 + 1 },
      geometry: {
        type: 'Point' as const,
        coordinates: [req.pickupLocation.longitude, req.pickupLocation.latitude]
      }
    }));
    setHeatmapData({ type: 'FeatureCollection', features });
  }, [rideRequests]);


  const handleSelectTrider = (trider: Trider | null) => {
    setSelectedTrider(trider);
    if (trider && selectedRideRequest && selectedRideRequest.pickupTodaZoneId === trider.todaZoneId) {
      fetchRoute(trider.location, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);
    } else if (trider && selectedRideRequest && selectedRideRequest.pickupTodaZoneId !== trider.todaZoneId) {
      toast({ title: "Zone Mismatch", description: `Trider ${trider.name} (${trider.todaZoneName}) cannot pick up in ${todaZones.find(z => z.id === selectedRideRequest.pickupTodaZoneId)?.name || 'this zone'}.`, variant: "destructive" });
      setRouteGeoJson(null);
    } else {
      setRouteGeoJson(null);
    }
  };
  
  const handleSelectRideRequest = (request: RideRequest | null) => {
    setSelectedRideRequest(request);
    if (request) {
      const pickupZoneId = request.pickupTodaZoneId || getTodaZoneForLocation(request.pickupLocation)?.id;
      if (!pickupZoneId) {
         toast({ title: "Unserviceable Area", description: "Pickup location is not within a TODA zone.", variant: "destructive" });
         setCandidateTriders([]);
      } else {
        const updatedRequest = { ...request, pickupTodaZoneId: pickupZoneId };
        setSelectedRideRequest(updatedRequest); // Ensure state has the zone ID
        const availableTridersInZone = triders.filter(t => t.status === 'available' && t.todaZoneId === pickupZoneId);
        setCandidateTriders(availableTridersInZone);
        if (availableTridersInZone.length === 0) {
           toast({ title: "No Triders Available", description: `No available triders in ${todaZones.find(z => z.id === pickupZoneId)?.name || 'this zone'}.` });
        }
      }

      if (selectedTrider && pickupZoneId === selectedTrider.todaZoneId) {
        fetchRoute(selectedTrider.location, request.pickupLocation, request.dropoffLocation);
      } else {
        setRouteGeoJson(null);
      }

    } else {
      setCandidateTriders(triders.filter(t => t.status === 'available')); // Show all available if no request selected
      setRouteGeoJson(null);
    }
  };

  const fetchRoute = async (start: Coordinates, pickup: Coordinates, dropoff: Coordinates) => {
    if (!MAPBOX_TOKEN) {
      toast({ title: "Map Error", description: "Mapbox token is missing.", variant: "destructive" });
      return;
    }
    setIsFetchingRoute(true);
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

    const ridePickupZoneId = selectedRideRequest.pickupTodaZoneId || getTodaZoneForLocation(selectedRideRequest.pickupLocation)?.id;

    if (!ridePickupZoneId) {
      toast({ title: "Dispatch Error", description: "Ride request pickup location is outside any TODA zone.", variant: "destructive" });
      return;
    }
    if (selectedTrider.todaZoneId !== ridePickupZoneId) {
      toast({ title: "Dispatch Error", description: `Trider ${selectedTrider.name} (${selectedTrider.todaZoneName}) cannot service rides in ${todaZones.find(z => z.id === ridePickupZoneId)?.name || 'this zone'}.`, variant: "destructive" });
      return;
    }

    setTriders(prev => prev.map(t => t.id === selectedTrider.id ? { ...t, status: 'assigned' } : t));
    setRideRequests(prev => prev.map(r => r.id === selectedRideRequest.id ? { ...r, status: 'assigned', assignedTriderId: selectedTrider.id } : r));
    
    toast({ title: "Ride Dispatched!", description: `${selectedTrider.name} assigned to ${selectedRideRequest.passengerName}.` });
    fetchRoute(selectedTrider.location, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);
  };

  const isDispatchDisabled = !selectedTrider || 
                             !selectedRideRequest || 
                             selectedTrider.status !== 'available' || 
                             selectedRideRequest.status !== 'pending' || 
                             isFetchingRoute ||
                             selectedTrider.todaZoneId !== (selectedRideRequest.pickupTodaZoneId || getTodaZoneForLocation(selectedRideRequest.pickupLocation)?.id);


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,0px))] md:h-screen">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto h-full max-h-[calc(100vh-2rem)] lg:max-h-full">
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Dispatch Control</CardTitle>
              <CardDescription>Select a ride and an available trider from the same TODA zone to dispatch.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRideRequest && <p className="text-sm mb-1">Ride: <span className="font-medium">{selectedRideRequest.passengerName}</span> (Zone: {todaZones.find(z=>z.id === selectedRideRequest.pickupTodaZoneId)?.name || 'N/A'})</p>}
              {selectedTrider && <p className="text-sm mb-2">Trider: <span className="font-medium">{selectedTrider.name}</span> ({selectedTrider.status}, Zone: {selectedTrider.todaZoneName})</p>}
              {!selectedRideRequest && !selectedTrider && <p className="text-sm text-muted-foreground">No ride or trider selected.</p>}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleDispatchRide} 
                disabled={isDispatchDisabled}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isFetchingRoute && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dispatch Ride
              </Button>
            </CardFooter>
          </Card>

          <div className="flex-grow min-h-[200px]">
            <TriderList 
              triders={selectedRideRequest ? candidateTriders : triders.filter(t => t.status === 'available')}
              selectedTriderId={selectedTrider?.id || null}
              onSelectTrider={handleSelectTrider} 
            />
          </div>
          <div className="flex-grow min-h-[200px]">
            <RideRequestList 
              rideRequests={rideRequests} 
              selectedRideRequestId={selectedRideRequest?.id || null}
              onSelectRideRequest={handleSelectRideRequest}
              todaZones={todaZones}
            />
          </div>
          <div className="flex-grow min-h-[150px]">
             <AiInsights insights={aiInsights} />
          </div>
        </div>

        <div className="lg:col-span-2 h-full min-h-[400px] lg:min-h-0 rounded-lg overflow-hidden shadow-lg border">
          <MapboxMap
            initialViewState={{
              longitude: LAS_PINAS_CENTER.longitude,
              latitude: LAS_PINAS_CENTER.latitude,
              zoom: 12, 
            }}
            triders={triders}
            rideRequests={rideRequests}
            selectedTrider={selectedTrider}
            onSelectTrider={handleSelectTrider}
            selectedRideRequest={selectedRideRequest}
            onSelectRideRequest={handleSelectRideRequest}
            routeGeoJson={routeGeoJson}
            heatmapData={heatmapData}
            todaZones={todaZones}
          />
        </div>
      </div>
    </div>
  );
}

