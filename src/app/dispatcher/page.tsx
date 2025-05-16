"use client";

import * as React from 'react';
import { MapboxMap } from '@/components/map/MapboxMap';
import { TriderList } from '@/components/dispatch/TriderList';
import { RideRequestList } from '@/components/dispatch/RideRequestList';
import { AiInsights } from '@/components/dispatch/AiInsights';
import type { Trider, RideRequest, AiInsight, Coordinates, TodaZone, RoutePath } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { isPointInCircle, getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext'; 

const FALLBACK_LAS_PINAS_CENTER: Coordinates = { latitude: 14.4445, longitude: 120.9938 };

const apostleNames = [
  "Peter", "Andrew", "James Z.", "John", "Philip", "Bartholomew", 
  "Thomas", "Matthew", "James A.", "Thaddaeus", "Simon Z.", "Matthias"
];

const initialTridersData: Omit<Trider, 'todaZoneName' | 'currentPath' | 'pathIndex'>[] = apostleNames.map((name, index) => {
  const todaZoneIndex = index % appTodaZones.length; 
  const todaZone = appTodaZones[todaZoneIndex];
  const randomLocationInZone = getRandomPointInCircle(todaZone.center, todaZone.radiusKm * 0.8);
  
  const statuses: Trider['status'][] = ['available', 'busy', 'offline', 'assigned'];
  let status = statuses[index % statuses.length];
  if (index < 4) status = 'available';

  return {
    id: `trider-apostle-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'Tricycle' : 'E-Bike',
    todaZoneId: todaZone.id,
  };
});

const initialTriders: Trider[] = initialTridersData.map(t => {
  const zone = appTodaZones.find(z => z.id === t.todaZoneId);
  return { ...t, todaZoneName: zone?.name || 'Unknown Zone', currentPath: null, pathIndex: 0 };
});


const initialRideRequests: RideRequest[] = [
  { 
    id: 'ride-1', 
    passengerName: 'Maria Makiling', 
    pickupLocation: getRandomPointInCircle(appTodaZones[0].center, appTodaZones[0].radiusKm * 0.7),
    dropoffLocation: { latitude: FALLBACK_LAS_PINAS_CENTER.latitude - 0.01, longitude: FALLBACK_LAS_PINAS_CENTER.longitude + 0.01 }, 
    pickupAddress: `${appTodaZones[0].areaOfOperation} area`, 
    dropoffAddress: 'SM Southmall, Las Piñas', 
    status: 'pending', 
    fare: 75.50, 
    requestedAt: new Date(Date.now() - 5 * 60 * 1000),
    pickupTodaZoneId: appTodaZones[0].id,
  },
  { 
    id: 'ride-2', 
    passengerName: 'Bernardo Carpio', 
    pickupLocation: getRandomPointInCircle(appTodaZones[2].center, appTodaZones[2].radiusKm * 0.7),
    dropoffLocation: { latitude: FALLBACK_LAS_PINAS_CENTER.latitude + 0.005, longitude: FALLBACK_LAS_PINAS_CENTER.longitude - 0.005 }, 
    pickupAddress: `${appTodaZones[2].areaOfOperation} area`, 
    dropoffAddress: 'BF Resort Village, Las Piñas', 
    status: 'assigned', 
    assignedTriderId: initialTriders.find(t => t.todaZoneId === appTodaZones[2].id && t.status !== 'offline')?.id || initialTriders[2].id,
    fare: 60.00, 
    requestedAt: new Date(Date.now() - 10 * 60 * 1000),
    pickupTodaZoneId: appTodaZones[2].id,
  },
];

const initialAiInsights: AiInsight[] = [
  { id: 'ai-1', title: 'High Demand Alert', description: `Increased ride requests near ${appTodaZones[7].name || 'Zapote area'}. Consider deploying more triders.`, severity: 'warning', timestamp: new Date(Date.now() - 2 * 60 * 1000), relatedLocation: appTodaZones[7].center },
  { id: 'ai-2', title: 'Route Optimization Available', description: `Trider ${initialTriders[0].name} can take a faster route via Friendship Route.`, severity: 'info', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
];


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function DispatcherPage() { // Renamed from DispatchPage
  const { 
    defaultMapZoom, 
    defaultMapCenter, 
    showHeatmap, 
    rideRequestIntervalMs, 
    triderUpdateIntervalMs,
    aiInsightIntervalMs,
    isLoading: settingsLoading 
  } = useSettings();

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
    setRideRequests(prevRequests => 
      prevRequests.map(req => {
        if (!req.pickupTodaZoneId) {
          const zone = getTodaZoneForLocation(req.pickupLocation);
          return { ...req, pickupTodaZoneId: zone?.id || null };
        }
        return req;
      })
    );
  }, [getTodaZoneForLocation]);


  React.useEffect(() => {
    if (settingsLoading) return; 
    const interval = setInterval(() => {
      setTriders(prevTriders =>
        prevTriders.map(trider => {
          if (trider.status === 'offline') return trider;

          let newLocation = { ...trider.location };
          const triderZone = todaZones.find(z => z.id === trider.todaZoneId);

          if ((trider.status === 'assigned' || trider.status === 'busy') && trider.currentPath && trider.currentPath.coordinates.length > 0) {
            let nextIndex = trider.pathIndex + 1;
            if (nextIndex < trider.currentPath.coordinates.length) {
              newLocation = { 
                longitude: trider.currentPath.coordinates[nextIndex][0], 
                latitude: trider.currentPath.coordinates[nextIndex][1] 
              };
            } else { // Reached end of path
              nextIndex = trider.currentPath.coordinates.length -1; // Stay at last point
              newLocation = { 
                longitude: trider.currentPath.coordinates[nextIndex][0], 
                latitude: trider.currentPath.coordinates[nextIndex][1] 
              };
              // Potentially change status here, e.g., if reached pickup or dropoff
              const ride = rideRequests.find(r => r.assignedTriderId === trider.id && (r.status === 'assigned' || r.status === 'in-progress'));
              if (ride) {
                if (trider.status === 'assigned' && calculateDistance(newLocation, ride.pickupLocation) < 0.02) { // Nearing pickup
                  // Could update ride to 'in-progress' here if dispatcher doesn't do it
                } else if (trider.status === 'busy' && calculateDistance(newLocation, ride.dropoffLocation) < 0.02) { // Nearing dropoff
                  // Could update ride to 'completed' and trider to 'available' here
                }
              }
            }
            return { ...trider, location: newLocation, pathIndex: nextIndex };
          } else if (trider.status === 'available' && triderZone) {
             newLocation = getRandomPointInCircle(triderZone.center, triderZone.radiusKm * 0.95);
          }
          
          if(triderZone && !isPointInCircle(newLocation, triderZone.center, triderZone.radiusKm)) {
             return { ...trider, location: getRandomPointInCircle(triderZone.center, triderZone.radiusKm * 0.9), currentPath: null, pathIndex: 0 };
          }
          return { ...trider, location: newLocation, currentPath: null, pathIndex: 0 };
        })
      );
    }, triderUpdateIntervalMs); 
    return () => clearInterval(interval);
  }, [rideRequests, todaZones, triderUpdateIntervalMs, settingsLoading, triders]);


  React.useEffect(() => {
    if (settingsLoading) return; 
    const rideInterval = setInterval(() => {
      if (todaZones.length === 0) return;

      const randomPickupZone = todaZones[Math.floor(Math.random() * todaZones.length)];
      const pickupLocation = getRandomPointInCircle(randomPickupZone.center, randomPickupZone.radiusKm * 0.9);
      
      let randomDropoffZone = todaZones[Math.floor(Math.random() * todaZones.length)];
      if (todaZones.length > 1 && randomDropoffZone.id === randomPickupZone.id) {
        randomDropoffZone = todaZones[(todaZones.findIndex(z => z.id === randomPickupZone.id) + 1) % todaZones.length];
      }
      const dropoffLocation = getRandomPointInCircle(randomDropoffZone.center, randomDropoffZone.radiusKm * 0.9);

      const newRideId = `ride-${Date.now()}`;
      const newRide: RideRequest = {
        id: newRideId,
        passengerName: `Passenger ${Math.floor(Math.random() * 1000)}`,
        pickupLocation,
        dropoffLocation,
        pickupAddress: `${randomPickupZone.areaOfOperation} vicinity`,
        dropoffAddress: `${randomDropoffZone.areaOfOperation} vicinity`,
        status: 'pending',
        requestedAt: new Date(),
        pickupTodaZoneId: randomPickupZone.id,
        fare: Math.floor(Math.random() * 100) + 50,
      };
      setRideRequests(prev => [newRide, ...prev.slice(0,19)]);
      toast({ title: "New Ride Request (Mock)", description: `${newRide.passengerName} in ${randomPickupZone.name} needs a ride.` });
    }, rideRequestIntervalMs); 

    const insightInterval = setInterval(() => {
      const newInsightId = `ai-${Date.now()}`;
      const randomZone = todaZones.length > 0 ? todaZones[Math.floor(Math.random() * todaZones.length)] : null;
      const newInsight: AiInsight = {
        id: newInsightId,
        title: `Dynamic Pricing Update (Mock)`,
        description: `Demand surge near ${randomZone?.name || 'a busy area'}. Fares increased by 1.2x.`,
        severity: 'info',
        timestamp: new Date(),
        relatedLocation: randomZone?.center
      };
      setAiInsights(prev => [newInsight, ...prev.slice(0,4)]);
    }, aiInsightIntervalMs); 

    return () => {
      clearInterval(rideInterval);
      clearInterval(insightInterval);
    };
  }, [toast, todaZones, getTodaZoneForLocation, rideRequestIntervalMs, aiInsightIntervalMs, settingsLoading]);

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
      fetchRouteAndUpdateTrider(trider, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);
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
         setRouteGeoJson(null);
      } else {
        const updatedRequest = { ...request, pickupTodaZoneId: pickupZoneId };
        setSelectedRideRequest(updatedRequest);
        const availableTridersInZone = triders.filter(t => t.status === 'available' && t.todaZoneId === pickupZoneId);
        setCandidateTriders(availableTridersInZone);
        
        if (availableTridersInZone.length === 0) {
           toast({ title: "No Triders Available", description: `No available triders in ${todaZones.find(z => z.id === pickupZoneId)?.name || 'this zone'}.` });
        }

        if (selectedTrider && pickupZoneId === selectedTrider.todaZoneId) {
          fetchRouteAndUpdateTrider(selectedTrider, request.pickupLocation, request.dropoffLocation);
        } else {
          setRouteGeoJson(null);
          if (selectedTrider && pickupZoneId !== selectedTrider.todaZoneId) {
             toast({ title: "Zone Mismatch", description: `Selected trider ${selectedTrider.name} is not in the pickup zone for this request.`, variant: "destructive" });
             setSelectedTrider(null);
          }
        }
      }
    } else {
      setCandidateTriders(triders.filter(t => t.status === 'available'));
      setRouteGeoJson(null);
    }
  };

  const fetchRouteAndUpdateTrider = async (trider: Trider, pickup: Coordinates, dropoff: Coordinates) => {
    if (!MAPBOX_TOKEN) {
      toast({ title: "Map Error", description: "Mapbox token is missing.", variant: "destructive" });
      return;
    }
    setIsFetchingRoute(true);
    const coordinatesString = `${trider.location.longitude},${trider.location.latitude};${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeGeometry = data.routes[0].geometry;
        setRouteGeoJson({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: routeGeometry }]
        });
        
        // Create a path for the trider to follow to pickup.
        // The full route from Mapbox is trider -> pickup -> dropoff.
        // We need to find the segment for trider -> pickup.
        // For simplicity, we'll use the entire first leg (trider to pickup) for the path.
        // A more complex approach would parse `steps` to find the exact coordinates for each leg.
        // Here, we assume data.routes[0].legs[0] is trider to pickup.
        const triderToPickupPath: RoutePath = {
            type: "LineString",
            coordinates: data.routes[0].legs[0].steps.flatMap((step: any) => step.geometry.coordinates)
        };

        setTriders(prev => prev.map(t => t.id === trider.id ? { ...t, currentPath: triderToPickupPath, pathIndex: 0 } : t));
        setSelectedTrider(prev => prev && prev.id === trider.id ? { ...prev, currentPath: triderToPickupPath, pathIndex: 0 } : prev);

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
      toast({ title: "Dispatch Error", description: `Trider ${selectedTrider.name} (${selectedTrider.todaZoneName}) is in zone ${selectedTrider.todaZoneName} and cannot service rides in ${todaZones.find(z => z.id === ridePickupZoneId)?.name || 'a different zone'}.`, variant: "destructive" });
      return;
    }

    // Fetch route first, and path will be set in fetchRouteAndUpdateTrider
    fetchRouteAndUpdateTrider(selectedTrider, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation)
      .then(() => {
          setTriders(prev => prev.map(t => t.id === selectedTrider.id ? { ...t, status: 'assigned' } : t));
          setRideRequests(prev => prev.map(r => r.id === selectedRideRequest.id ? { ...r, status: 'assigned', assignedTriderId: selectedTrider.id } : r));
          
          toast({ title: "Ride Dispatched! (Mock)", description: `${selectedTrider.name} assigned to ${selectedRideRequest.passengerName}.` });
          // Keep selectedTrider and selectedRideRequest for map display, but update candidate list
          const updatedCandidateTriders = triders.filter(t => t.status === 'available' && t.todaZoneId === ridePickupZoneId && t.id !== selectedTrider.id);
          setCandidateTriders(updatedCandidateTriders);
      })
      .catch(() => {
          // Error already handled by toast in fetchRouteAndUpdateTrider
      });
  };

  const isDispatchDisabled = !selectedTrider || 
                             !selectedRideRequest || 
                             selectedTrider.status !== 'available' || 
                             selectedRideRequest.status !== 'pending' || 
                             isFetchingRoute ||
                             selectedTrider.todaZoneId !== (selectedRideRequest.pickupTodaZoneId || getTodaZoneForLocation(selectedRideRequest.pickupLocation)?.id);

  const mapInitialViewState = React.useMemo(() => ({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom,
  }), [defaultMapCenter, defaultMapZoom]);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,0px))] md:h-screen">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto h-full max-h-[calc(100vh-2rem)] lg:max-h-full">
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Dispatch Control</CardTitle>
              <CardDescription>Select a ride and an available trider from the same TODA zone to dispatch. Data is currently mocked.</CardDescription>
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
            initialViewState={mapInitialViewState}
            triders={triders}
            rideRequests={rideRequests}
            selectedTrider={selectedTrider}
            onSelectTrider={handleSelectTrider}
            selectedRideRequest={selectedRideRequest}
            onSelectRideRequest={handleSelectRideRequest}
            routeGeoJson={routeGeoJson}
            heatmapData={heatmapData}
            todaZones={todaZones}
            showHeatmap={showHeatmap}
          />
        </div>
      </div>
    </div>
  );
}
