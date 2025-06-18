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
import { Loader2, ListChecks, Map, ArrowRightCircle } from 'lucide-react';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { isPointInCircle, getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext'; 
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

const FALLBACK_LAS_PINAS_CENTER: Coordinates = { latitude: 14.4445, longitude: 120.9938 };

const initialTalonKuatroTridersData: Omit<Trider, 'todaZoneName' | 'currentPath' | 'pathIndex'>[] = [
  "Peter", "Andrew", "James Z.", "John", "Philip", "Bartholomew", "Thomas", "Matthew", "James A.", "Thaddaeus"
].map((name, index) => {
  const talonKuatroZone = appTodaZones.find(z => z.id === '2');
  if (!talonKuatroZone) throw new Error("Talon Kuatro zone not found.");
  const randomLocationInZone = getRandomPointInCircle(talonKuatroZone.center, talonKuatroZone.radiusKm * 0.8);
  const statuses: Trider['status'][] = ['available', 'busy', 'offline', 'assigned'];
  let status = statuses[index % statuses.length];
  if (index < 5) status = 'available'; 

  return {
    id: `trider-dispatch-tk-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'Tricycle' : 'E-Bike',
    todaZoneId: '2',
  };
});

const initialTeptodaTridersData: Omit<Trider, 'todaZoneName' | 'currentPath' | 'pathIndex'>[] = [
  "Judas Iscariot (TEP)", "Simon Peter (TEP)", "John the Baptist (TEP)", "Mary Magdalene (TEP)", "Lazarus (TEP)"
].map((name, index) => {
  const teptodaZone = appTodaZones.find(z => z.id === '7');
  if (!teptodaZone) throw new Error("TEPTODA zone not found.");
  const randomLocationInZone = getRandomPointInCircle(teptodaZone.center, teptodaZone.radiusKm * 0.8);
  const statuses: Trider['status'][] = ['available', 'offline', 'busy', 'assigned'];
  let status = statuses[index % statuses.length];
  if (index < 2) status = 'available';

  return {
    id: `trider-dispatch-tep-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'E-Bike' : 'Tricycle',
    todaZoneId: '7',
  };
});

const initialP1TodaTridersData: Omit<Trider, 'todaZoneName' | 'currentPath' | 'pathIndex'>[] = [
  "Simon Z. (P1)", "Matthias (P1)", "Paul (P1)"
].map((name, index) => {
  const p1TodaZone = appTodaZones.find(z => z.id === '21');
  if (!p1TodaZone) throw new Error("P1TODA zone not found.");
  const randomLocationInZone = getRandomPointInCircle(p1TodaZone.center, p1TodaZone.radiusKm * 0.8);
  const statuses: Trider['status'][] = ['available', 'offline', 'busy'];
  let status = statuses[index % statuses.length];
  if (index < 1) status = 'available';

  return {
    id: `trider-dispatch-p1-${index + 1}`,
    name: name,
    location: randomLocationInZone,
    status: status,
    vehicleType: index % 2 === 0 ? 'Tricycle' : 'E-Bike',
    todaZoneId: '21',
  };
});


const initialTridersData: Omit<Trider, 'todaZoneName' | 'currentPath' | 'pathIndex'>[] = [
  ...initialTalonKuatroTridersData,
  ...initialTeptodaTridersData,
  ...initialP1TodaTridersData
];


const initialTriders: Trider[] = initialTridersData.map(t => {
  const zone = appTodaZones.find(z => z.id === t.todaZoneId);
  return { ...t, todaZoneName: zone?.name || 'Unknown Zone', currentPath: null, pathIndex: 0 };
});


const initialRideRequests: RideRequest[] = [
  { 
    id: 'ride-dispatch-1', 
    passengerName: 'Juana Dela Cruz', 
    pickupLocation: getRandomPointInCircle(appTodaZones.find(z => z.id === '2')!.center, appTodaZones.find(z => z.id === '2')!.radiusKm * 0.7),
    dropoffLocation: { latitude: FALLBACK_LAS_PINAS_CENTER.latitude - 0.01, longitude: FALLBACK_LAS_PINAS_CENTER.longitude + 0.01 }, 
    pickupAddress: `${appTodaZones.find(z => z.id === '2')!.areaOfOperation} area`, 
    dropoffAddress: 'Alabang Town Center', 
    status: 'pending', 
    fare: 85.00, 
    requestedAt: new Date(Date.now() - 3 * 60 * 1000),
    pickupTodaZoneId: '2',
    ticketId: `TKT-${Date.now() + 1}`
  },
  { 
    id: 'ride-dispatch-tep-1', 
    passengerName: 'Sisa Magtanggol', 
    pickupLocation: getRandomPointInCircle(appTodaZones.find(z => z.id === '7')!.center, appTodaZones.find(z => z.id === '7')!.radiusKm * 0.7),
    dropoffLocation: { latitude: FALLBACK_LAS_PINAS_CENTER.latitude + 0.015, longitude: FALLBACK_LAS_PINAS_CENTER.longitude - 0.008 }, 
    pickupAddress: `${appTodaZones.find(z => z.id === '7')!.areaOfOperation} area`, 
    dropoffAddress: 'Perpetual Help Medical Center', 
    status: 'pending', 
    fare: 70.00, 
    requestedAt: new Date(Date.now() - 5 * 60 * 1000),
    pickupTodaZoneId: '7',
    ticketId: `TKT-${Date.now() + 3}`
  },
  { 
    id: 'ride-dispatch-2', 
    passengerName: 'Pedro Penduko', 
    pickupLocation: getRandomPointInCircle(appTodaZones.find(z => z.id === '2')!.center, appTodaZones.find(z => z.id === '2')!.radiusKm * 0.7),
    dropoffLocation: { latitude: FALLBACK_LAS_PINAS_CENTER.latitude + 0.005, longitude: FALLBACK_LAS_PINAS_CENTER.longitude - 0.005 }, 
    pickupAddress: `${appTodaZones.find(z => z.id === '2')!.areaOfOperation} area`, 
    dropoffAddress: 'Robinsons Place Las Piñas', 
    status: 'assigned', 
    assignedTriderId: initialTriders.find(t => t.todaZoneId === '2' && t.status !== 'offline')?.id || initialTriders[0].id,
    fare: 55.00, 
    requestedAt: new Date(Date.now() - 8 * 60 * 1000),
    pickupTodaZoneId: '2',
    ticketId: `TKT-${Date.now() + 2}`
  },
];

const initialAiInsights: AiInsight[] = [
  { id: 'ai-dispatch-1', title: 'High Demand Alert', description: `Increased ride requests near ${appTodaZones.find(z => z.id === '2')?.name}. Consider deploying more triders.`, severity: 'warning', timestamp: new Date(Date.now() - 2 * 60 * 1000), relatedLocation: appTodaZones.find(z => z.id === '2')?.center },
  { id: 'ai-dispatch-2', title: 'Route Optimization Available', description: `Trider ${initialTriders[0]?.name} can take a faster route.`, severity: 'info', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
  { id: 'ai-dispatch-tep-1', title: 'Moderate Demand in TEPTODA', description: `Consider rebalancing if triders are idle elsewhere.`, severity: 'info', timestamp: new Date(Date.now() - 5 * 60 * 1000), relatedLocation: appTodaZones.find(z => z.id === '7')?.center },
];


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type ActiveView = 'control' | 'map';

export default function TodaDispatcherPage() {
  const params = useParams();
  const todaId = params.todaId as string;

  const { 
    defaultMapZoom, 
    defaultMapCenter, 
    showHeatmap, 
    rideRequestIntervalMs, 
    triderUpdateIntervalMs,
    aiInsightIntervalMs,
    isLoading: settingsLoading,
    getTodaBaseFare, 
    perKmCharge,     
    convenienceFee   
  } = useSettings();

  const [triders, setTriders] = React.useState<Trider[]>([]);
  const [rideRequests, setRideRequests] = React.useState<RideRequest[]>([]);
  const [aiInsights, setAiInsights] = React.useState<AiInsight[]>([]);
  const [todaZones] = React.useState<TodaZone[]>(appTodaZones);
  const currentTodaZone = React.useMemo(() => todaZones.find(z => z.id === todaId), [todaId, todaZones]);

  const [selectedTrider, setSelectedTrider] = React.useState<Trider | null>(null);
  const [selectedRideRequest, setSelectedRideRequest] = React.useState<RideRequest | null>(null);
  
  const [routeGeoJson, setRouteGeoJson] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [heatmapData, setHeatmapData] = React.useState<GeoJSON.FeatureCollection | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = React.useState(false);
  const [candidateTriders, setCandidateTriders] = React.useState<Trider[]>([]);

  const [activeView, setActiveView] = React.useState<ActiveView>('map');


  const { toast } = useToast();

  React.useEffect(() => {
    if (currentTodaZone) {
      setTriders(initialTriders.filter(t => t.todaZoneId === todaId));
      setRideRequests(initialRideRequests.filter(r => r.pickupTodaZoneId === todaId));
      setAiInsights(initialAiInsights.filter(ai => ai.relatedLocation && getTodaZoneForLocation(ai.relatedLocation)?.id === todaId));
      setCandidateTriders(initialTriders.filter(t => t.status === 'available' && t.todaZoneId === todaId));
    }
  }, [todaId, currentTodaZone]);


  const getTodaZoneForLocation = React.useCallback((location: Coordinates): TodaZone | null => {
    for (const zone of todaZones) {
      if (isPointInCircle(location, zone.center, zone.radiusKm)) {
        return zone;
      }
    }
    return null;
  }, [todaZones]);

  const calculateMockFare = React.useCallback((pickupLoc: Coordinates, dropoffLoc: Coordinates, pickupZoneId: string | null): number => {
    if (!pickupLoc || !dropoffLoc || !pickupZoneId) return 0;
    const distance = calculateDistance(pickupLoc, dropoffLoc);
    const todaBase = getTodaBaseFare(pickupZoneId); 
    const fare = todaBase + (distance * perKmCharge) + convenienceFee; 
    return parseFloat(fare.toFixed(2));
  }, [getTodaBaseFare, perKmCharge, convenienceFee]);

  React.useEffect(() => {
    if (settingsLoading) return; 
    setRideRequests(prevRequests => 
      prevRequests.map(req => {
        const updatedReq = { ...req };
        if (!updatedReq.pickupTodaZoneId) {
          const zone = getTodaZoneForLocation(updatedReq.pickupLocation);
          updatedReq.pickupTodaZoneId = zone?.id || null;
        }
        if (updatedReq.pickupTodaZoneId) {
           updatedReq.fare = calculateMockFare(updatedReq.pickupLocation, updatedReq.dropoffLocation, updatedReq.pickupTodaZoneId);
        }
        return updatedReq;
      })
    );
  }, [getTodaZoneForLocation, calculateMockFare, settingsLoading]);


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
            } else { 
              nextIndex = trider.currentPath.coordinates.length -1; 
              newLocation = { 
                longitude: trider.currentPath.coordinates[nextIndex][0], 
                latitude: trider.currentPath.coordinates[nextIndex][1] 
              };
            }
            return { ...trider, location: newLocation, pathIndex: nextIndex };
          } else if (trider.status === 'available' && triderZone) {
             newLocation = getRandomPointInCircle(triderZone.center, triderZone.radiusKm * 0.95);
          }
          
          if(triderZone && !isPointInCircle(newLocation, triderZone.center, triderZone.radiusKm)) {
             return { ...trider, location: getRandomPointInCircle(triderZone.center, triderZone.radiusKm * 0.9), currentPath: null, pathIndex: 0 };
          }
          return { ...trider, location: newLocation, currentPath: trider.status === 'available' ? null : trider.currentPath, pathIndex: trider.status === 'available' ? 0 : trider.pathIndex };
        })
      );
    }, triderUpdateIntervalMs); 
    return () => clearInterval(interval);
  }, [rideRequests, todaZones, triderUpdateIntervalMs, settingsLoading]);


  React.useEffect(() => {
    if (settingsLoading || !currentTodaZone) return; 
    const rideInterval = setInterval(() => {
      const randomPickupZone = currentTodaZone; 
      const pickupLocation = getRandomPointInCircle(randomPickupZone.center, randomPickupZone.radiusKm * 0.9);
      
      let randomDropoffZone = todaZones[Math.floor(Math.random() * todaZones.length)];
      if (todaZones.length > 1 && randomDropoffZone.id === randomPickupZone.id) {
        randomDropoffZone = todaZones[(todaZones.findIndex(z => z.id === randomPickupZone.id) + 1) % todaZones.length];
      }
      const dropoffLocation = getRandomPointInCircle(randomDropoffZone.center, randomDropoffZone.radiusKm * 0.9);

      const newRideId = `ride-dispatch-${Date.now()}`;
      const fare = calculateMockFare(pickupLocation, dropoffLocation, randomPickupZone.id);
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
        fare: fare,
        ticketId: `TKT-${Date.now()}`
      };
      setRideRequests(prev => [newRide, ...prev.slice(0,19)]);
      toast({ title: "New Ride Request (Mock)", description: `${newRide.passengerName} in ${randomPickupZone.name} needs a ride.` });
    }, rideRequestIntervalMs); 

    const insightInterval = setInterval(() => {
      const newInsightId = `ai-dispatch-${Date.now()}`;
      const newInsight: AiInsight = {
        id: newInsightId,
        title: `Dynamic Pricing Update (Mock)`,
        description: `Demand surge near ${currentTodaZone.name}. Fares increased by 1.2x.`,
        severity: 'info',
        timestamp: new Date(),
        relatedLocation: currentTodaZone.center
      };
      setAiInsights(prev => [newInsight, ...prev.slice(0,4)]);
    }, aiInsightIntervalMs); 

    return () => {
      clearInterval(rideInterval);
      clearInterval(insightInterval);
    };
  }, [toast, todaZones, getTodaZoneForLocation, rideRequestIntervalMs, aiInsightIntervalMs, settingsLoading, calculateMockFare, currentTodaZone]);

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


  const fetchRouteAndUpdateTrider = React.useCallback(async (trider: Trider, pickup: Coordinates, dropoff: Coordinates) => {
    if (!MAPBOX_TOKEN) {
      toast({ title: "Map Error", description: "Mapbox token is missing.", variant: "destructive" });
      return;
    }
    setIsFetchingRoute(true);
    const coordinatesString = `${trider.location.longitude},${trider.location.latitude};${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&alternatives=true&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      let chosenRoute = null;
      if (data.routes && data.routes.length > 0) {
        if (data.routes.length > 1) {
          chosenRoute = data.routes.reduce((shortest: any, current: any) => {
            return current.distance < shortest.distance ? current : shortest;
          });
          toast({ title: "Route Updated (Shortest Distance)", description: `Using shortest of ${data.routes.length} alternatives.` });
        } else {
          chosenRoute = data.routes[0];
        }

        const routeGeometry = chosenRoute.geometry;
        setRouteGeoJson({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: routeGeometry }]
        });
        
        const triderToPickupPath: RoutePath = {
            type: "LineString",
            coordinates: chosenRoute.legs[0].steps.flatMap((step: any) => step.geometry.coordinates)
        };

        setTriders(prev => prev.map(t => t.id === trider.id ? { ...t, currentPath: triderToPickupPath, pathIndex: 0 } : t));
        setSelectedTrider(prev => prev && prev.id === trider.id ? { ...prev, currentPath: triderToPickupPath, pathIndex: 0 } : prev);

        const durationMinutes = Math.round(chosenRoute.duration / 60);
        const distanceKm = (chosenRoute.distance / 1000).toFixed(1);
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
  }, [toast]);


  const handleSelectTrider = React.useCallback((trider: Trider | null) => {
    if (!trider) {
      setSelectedTrider(null);
      if (!selectedRideRequest) setRouteGeoJson(null); // Clear route only if no ride is selected
      return;
    }
  
    if (selectedRideRequest) {
      const ridePickupZoneId = selectedRideRequest.pickupTodaZoneId || getTodaZoneForLocation(selectedRideRequest.pickupLocation)?.id;
      if (ridePickupZoneId && trider.todaZoneId === ridePickupZoneId) {
        setSelectedTrider(trider);
        fetchRouteAndUpdateTrider(trider, selectedRideRequest.pickupLocation, selectedRideRequest.dropoffLocation);
      } else {
        setSelectedTrider(trider); // Still select the trider
        toast({
          title: "Zone Mismatch",
          description: `Trider ${trider.name} (${trider.todaZoneName}) is in a different zone than the ride request (${todaZones.find(z => z.id === ridePickupZoneId)?.name || 'N/A'}). Dispatch will be disabled.`,
          variant: "destructive"
        });
        setRouteGeoJson(null); // Clear route due to mismatch
      }
    } else {
      setSelectedTrider(trider); // No ride request selected, just select the trider
      setRouteGeoJson(null); // Clear any existing route
    }
  }, [selectedRideRequest, getTodaZoneForLocation, fetchRouteAndUpdateTrider, todaZones, toast]);
  
  const handleSelectRideRequest = React.useCallback((request: RideRequest | null) => {
    if (!request) {
      setSelectedRideRequest(null);
      setCandidateTriders(triders.filter(t => t.status === 'available' && t.todaZoneId === todaId));
      if (!selectedTrider) setRouteGeoJson(null); // Clear route only if no trider is selected
      return;
    }
  
    const pickupZoneId = request.pickupTodaZoneId || getTodaZoneForLocation(request.pickupLocation)?.id;
  
    if (!pickupZoneId) {
      toast({ title: "Unserviceable Area", description: "Ride pickup location is not within a TODA zone.", variant: "destructive" });
      setSelectedRideRequest(request); 
      setCandidateTriders([]);
      setSelectedTrider(null); 
      setRouteGeoJson(null);
      return;
    }
    
    const updatedRequest = { ...request, pickupTodaZoneId: pickupZoneId };
    setSelectedRideRequest(updatedRequest);
    setCandidateTriders(triders.filter(t => t.status === 'available' && t.todaZoneId === pickupZoneId));
  
    if (selectedTrider) {
      if (selectedTrider.todaZoneId === pickupZoneId) {
        fetchRouteAndUpdateTrider(selectedTrider, updatedRequest.pickupLocation, updatedRequest.dropoffLocation);
      } else {
        toast({
          title: "Zone Mismatch",
          description: `Previously selected trider ${selectedTrider.name} (${selectedTrider.todaZoneName}) is not in the ride's zone (${todaZones.find(z => z.id === pickupZoneId)?.name || 'N/A'}). Please select a trider from the updated list.`,
          variant: "destructive"
        });
        setSelectedTrider(null); 
        setRouteGeoJson(null);
      }
    } else {
      setRouteGeoJson(null); 
    }
  }, [selectedTrider, getTodaZoneForLocation, fetchRouteAndUpdateTrider, todaZones, toast, triders, todaId]);


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

    const ridePickupZoneId = selectedRideRequest.pickupTodaZoneId;

    if (!ridePickupZoneId) {
      toast({ title: "Dispatch Error", description: "Ride request pickup location is outside any TODA zone or zone could not be determined.", variant: "destructive" });
      return;
    }
    if (selectedTrider.todaZoneId !== ridePickupZoneId) {
      toast({ title: "Dispatch Error", description: `Trider ${selectedTrider.name} (${selectedTrider.todaZoneName}) cannot service rides in ${todaZones.find(z => z.id === ridePickupZoneId)?.name || 'a different zone'}.`, variant: "destructive" });
      return;
    }

    setTriders(prev => prev.map(t => t.id === selectedTrider!.id ? { ...t, status: 'assigned' } : t));
    setRideRequests(prev => prev.map(r => r.id === selectedRideRequest!.id ? { ...r, status: 'assigned', assignedTriderId: selectedTrider!.id } : r));
    
    toast({ title: "Ride Dispatched! (Mock)", description: `${selectedTrider!.name} assigned to ${selectedRideRequest!.passengerName}.` });
    
    const updatedCandidateTriders = candidateTriders.filter(t => t.id !== selectedTrider!.id);
    setCandidateTriders(updatedCandidateTriders);
    setSelectedTrider(null); 
  };
  
  const resolvedRidePickupZoneId = selectedRideRequest?.pickupTodaZoneId;
  const isDispatchDisabled = !selectedTrider || 
                             !selectedRideRequest || 
                             selectedTrider.status !== 'available' || 
                             selectedRideRequest.status !== 'pending' || 
                             isFetchingRoute ||
                             !resolvedRidePickupZoneId || 
                             selectedTrider.todaZoneId !== resolvedRidePickupZoneId;

  const mapInitialViewState = React.useMemo(() => ({
    longitude: currentTodaZone?.center.longitude || defaultMapCenter.longitude,
    latitude: currentTodaZone?.center.latitude || defaultMapCenter.latitude,
    zoom: defaultMapZoom,
  }), [currentTodaZone, defaultMapCenter, defaultMapZoom]);

  if (settingsLoading || !currentTodaZone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,0px))] md:h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Dispatcher Dashboard for {currentTodaZone.name}</h1>
      <div className="mb-4 p-1 rounded-md bg-card border border-border inline-flex">
        <Button
          variant="ghost"
          onClick={() => setActiveView('control')}
          className={cn(
            "flex-1 justify-center px-4 py-2 text-sm font-medium rounded-sm",
            activeView === 'control' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ListChecks className="mr-2 h-4 w-4" />
          Dispatch Control
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveView('map')}
          className={cn(
            "flex-1 justify-center px-4 py-2 text-sm font-medium rounded-sm",
            activeView === 'map' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Map className="mr-2 h-4 w-4" />
          Map View
        </Button>
      </div>

      <div className="flex-grow grid grid-cols-1 overflow-hidden">
        {activeView === 'control' && (
           <div className="flex flex-col gap-4 h-full"> {/* Main container for control view */}
            <Card className="flex-shrink-0"> {/* Dispatch Control Card */}
              <CardHeader>
                <CardTitle className="text-lg">Dispatch Control</CardTitle>
                <CardDescription>Select a ride and an available trider from the same TODA zone to dispatch. All data is mocked.</CardDescription>
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
                  {!isDispatchDisabled && <ArrowRightCircle className="ml-2 h-5 w-5" />}
                </Button>
              </CardFooter>
            </Card>

            {/* This div will contain the two lists and should grow to fill available space */}
            <div className="flex-grow grid md:grid-cols-2 gap-4 min-h-0"> 
              <TriderList 
                triders={selectedRideRequest ? candidateTriders : triders.filter(t => t.status === 'available')}
                selectedTriderId={selectedTrider?.id || null}
                onSelectTrider={handleSelectTrider} 
              />
              <RideRequestList 
                rideRequests={rideRequests.filter(r => r.status === 'pending')}
                selectedRideRequestId={selectedRideRequest?.id || null}
                onSelectRideRequest={handleSelectRideRequest}
                todaZones={todaZones}
              />
            </div>
            
            <div className="flex-shrink-0 mt-4"> {/* AI Insights at the bottom */}
               <AiInsights insights={aiInsights} />
            </div>
          </div>
        )}

        {activeView === 'map' && (
          <div className="h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg border">
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
              restrictedTodaZone={currentTodaZone}
            />
          </div>
        )}
      </div>
    </div>
  );
}
