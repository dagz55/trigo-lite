
"use client";

import * as React from 'react';
import { MapPin, Dot, Search, Bike, User, ArrowRight, CircleDollarSign, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added import
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import type { Coordinates, PassengerRideState, TriderProfile, RideRequest, RideRequestStatus, RoutePath } from '@/types';
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
  currentPath: null,
  pathIndex: 0,
}));

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

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
    pickupAddress: '', 
    dropoffAddress: '', 
    estimatedFare: null,
    assignedTrider: null,
    currentRideId: null,
    triderToPickupPath: null,
    pickupToDropoffPath: null,
    currentTriderPathIndex: 0,
  });

  const [triderSimLocation, setTriderSimLocation] = React.useState<Coordinates | null>(null);
  const [estimatedETA, setEstimatedETA] = React.useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = React.useState(false);

  const [pickupInput, setPickupInput] = React.useState('');
  const [dropoffInput, setDropoffInput] = React.useState('');
  const [pickupSuggestions, setPickupSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = React.useState<'pickup' | 'dropoff' | null>(null);
  
  const [pickupRouteColor, setPickupRouteColor] = React.useState('hsl(var(--accent))');
  const [dropoffRouteColor, setDropoffRouteColor] = React.useState('hsl(var(--primary))');

  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      const accentColorVar = computedStyles.getPropertyValue('--accent').trim();
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
      setPickupRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'lime');
      setDropoffRouteColor(primaryColorVar ? parseHsl(primaryColorVar) : 'teal');
    }
  }, []);

  const handleStatusToast = React.useCallback((title: string, description: string) => {
    toast({ title, description });
  }, [toast]);

  React.useEffect(() => {
    if (rideState.status === 'idle' && navigator.geolocation && MAPBOX_TOKEN) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&limit=1`);
            const data = await response.json();
            let address = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
            if (data.features && data.features.length > 0) {
              address = data.features[0].place_name;
            }
            setRideState(prev => ({ ...prev, pickupLocation: coords, pickupAddress: address, status: 'selectingDropoff' }));
            setPickupInput(address);
            toast({ title: "Pickup Location Set", description: `Current location: ${address.substring(0,30)}... Now select dropoff.` });
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setRideState(prev => ({ ...prev, pickupLocation: coords, pickupAddress: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, status: 'selectingDropoff' }));
            setPickupInput(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
            toast({ title: "Pickup Location Set", description: "Using current coordinates. Now select dropoff." });
          } finally {
             setViewState(prev => ({ ...prev, ...coords, zoom: 15 }));
             setIsGeolocating(false);
          }
        },
        (error) => {
          console.warn("Error getting geolocation:", error.message);
          toast({ title: "Geolocation Failed", description: "Could not get current location. Please set pickup manually.", variant: "destructive" });
          setRideState(prev => ({ ...prev, status: 'selectingPickup' })); 
          setIsGeolocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [MAPBOX_TOKEN, rideState.status, toast]); 

  React.useEffect(() => {
    if (settingsLoading) return;
    setViewState(prev => ({
      ...prev,
      longitude: defaultMapCenter.longitude,
      latitude: defaultMapCenter.latitude,
      zoom: defaultMapZoom + 1,
    }));
  }, [defaultMapCenter, defaultMapZoom, settingsLoading]);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if ((rideState.status === 'triderAssigned' && rideState.triderToPickupPath && triderSimLocation) || (rideState.status === 'inProgress' && rideState.pickupToDropoffPath && triderSimLocation)) {
      const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
      const targetLocation = rideState.status === 'triderAssigned' ? rideState.pickupLocation : rideState.dropoffLocation;

      intervalId = setInterval(() => {
        setTriderSimLocation(prevLoc => {
          if (!prevLoc || !currentPath || !targetLocation || rideState.currentTriderPathIndex === undefined) return prevLoc;
          
          let nextIndex = rideState.currentTriderPathIndex + 1;
          if (nextIndex < currentPath.coordinates.length) {
            const newCoords = {
              longitude: currentPath.coordinates[nextIndex][0],
              latitude: currentPath.coordinates[nextIndex][1],
            };
            setRideState(rs => ({ ...rs, currentTriderPathIndex: nextIndex }));
            if(rideState.status === 'triderAssigned' && rideState.pickupLocation) fetchRoute(newCoords, rideState.pickupLocation, 'triderToPickup', false); // Don't show toast for intermediate updates
            if(rideState.status === 'inProgress' && rideState.dropoffLocation) fetchRoute(newCoords, rideState.dropoffLocation, 'pickupToDropoff', false); // Don't show toast
            return newCoords;
          } else { 
            if (rideState.status === 'triderAssigned') {
              setRideState(rs => ({ ...rs, status: 'inProgress', currentTriderPathIndex: 0 })); 
              if (rideState.pickupLocation && rideState.dropoffLocation) {
                fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff');
              }
            } else if (rideState.status === 'inProgress') {
              setRideState(rs => ({ ...rs, status: 'completed' }));
              setEstimatedETA(null);
            }
            return targetLocation; 
          }
        });
      }, 2000); 
    }
    return () => clearInterval(intervalId);
  }, [rideState.status, rideState.triderToPickupPath, rideState.pickupToDropoffPath, rideState.pickupLocation, rideState.dropoffLocation, rideState.currentTriderPathIndex, triderSimLocation]);


  React.useEffect(() => {
    if (rideState.status === 'inProgress') {
      handleStatusToast("Trider Arrived", `${rideState.assignedTrider?.name} has arrived at your pickup location.`);
    } else if (rideState.status === 'completed') {
      handleStatusToast("Ride Completed", `You have arrived at your destination. Thank you for using TriGo!`);
    }
  }, [rideState.status, rideState.assignedTrider?.name, handleStatusToast]);


  const fetchRoute = async (start: Coordinates, end: Coordinates, routeType: 'triderToPickup' | 'pickupToDropoff' | 'confirmation', showToastFeedback: boolean = true) => {
    if (!MAPBOX_TOKEN) return;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeGeometry: RoutePath = data.routes[0].geometry;
        const durationMinutes = Math.round(data.routes[0].duration / 60);
        setEstimatedETA(`${durationMinutes} min`);

        if (routeType === 'triderToPickup') {
          setRideState(prev => ({ ...prev, triderToPickupPath: routeGeometry, pickupToDropoffPath: null }));
        } else if (routeType === 'pickupToDropoff') {
          setRideState(prev => ({ ...prev, pickupToDropoffPath: routeGeometry, triderToPickupPath: null }));
        } else if (routeType === 'confirmation') {
           setRideState(prev => ({ ...prev, pickupToDropoffPath: routeGeometry, triderToPickupPath: null }));
        }
      } else {
        setEstimatedETA(null);
        if (routeType !== 'confirmation') setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null }));
        if (showToastFeedback) toast({title: "Route Not Found", description: "Could not calculate route for the selected points.", variant: "destructive"});
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setEstimatedETA(null);
      if (routeType !== 'confirmation') setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null }));
      if (showToastFeedback) toast({title: "Route Error", description: "Failed to fetch route information.", variant: "destructive"});
    }
  };

  const handleGeocodeSearch = async (searchText: string, type: 'pickup' | 'dropoff') => {
    if (!searchText.trim() || !MAPBOX_TOKEN) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=PH&limit=5`);
      const data = await response.json();
      if (type === 'pickup') {
        setPickupSuggestions(data.features || []);
        setActiveSuggestionBox('pickup');
      } else {
        setDropoffSuggestions(data.features || []);
        setActiveSuggestionBox('dropoff');
      }
    } catch (error) {
      console.error("Error fetching geocoding suggestions:", error);
      toast({ title: "Address Search Error", description: "Could not fetch address suggestions.", variant: "destructive" });
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSuggestionSelect = (suggestion: MapboxGeocodingFeature, type: 'pickup' | 'dropoff') => {
    const location: Coordinates = { longitude: suggestion.center[0], latitude: suggestion.center[1] };
    if (type === 'pickup') {
      setRideState(prev => ({ ...prev, pickupLocation: location, pickupAddress: suggestion.place_name, status: prev.dropoffLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setPickupInput(suggestion.place_name);
      setPickupSuggestions([]);
      if (rideState.dropoffLocation) {
        fetchRoute(location, rideState.dropoffLocation, 'confirmation');
        const fare = calculateDistance(location, rideState.dropoffLocation) * 20 + 30; // Recalculate fare
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    } else {
      setRideState(prev => ({ ...prev, dropoffLocation: location, dropoffAddress: suggestion.place_name, status: prev.pickupLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setDropoffInput(suggestion.place_name);
      setDropoffSuggestions([]);
      if (rideState.pickupLocation) {
        fetchRoute(rideState.pickupLocation, location, 'confirmation');
        const fare = calculateDistance(rideState.pickupLocation, location) * 20 + 30;
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    }
    setViewState(prev => ({ ...prev, ...location, zoom: 15 }));
    setActiveSuggestionBox(null);
    
    if (type === 'pickup' && !rideState.dropoffLocation) {
        toast({title: "Pickup Set", description: "Now select or search for your dropoff location."})
    } else if (type === 'dropoff' && !rideState.pickupLocation) {
         toast({title: "Dropoff Set", description: "Now select or search for your pickup location."})
    } else if (rideState.pickupLocation && rideState.dropoffLocation) { // This condition will be met when the second location is set
        toast({title: "Locations Set", description: "Confirm your ride details."})
    }
  };
  
  const handleMapClick = (event: mapboxgl.MapLayerMouseEvent) => {
    if (isSearchingAddress) return; // Prevent map click while searching
    const { lngLat } = event;
    const newLocation = { longitude: lngLat.lng, latitude: lngLat.lat };
    const newAddress = `Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`;

    if (!rideState.pickupLocation || rideState.status === 'selectingPickup' ) {
      setRideState(prev => ({ ...prev, status: 'selectingDropoff', pickupLocation: newLocation, pickupAddress: newAddress }));
      setPickupInput(newAddress);
      setPickupSuggestions([]);
      toast({ title: "Pickup Set", description: "Now select your dropoff location." });
       if (rideState.dropoffLocation) {
         fetchRoute(newLocation, rideState.dropoffLocation, 'confirmation');
         const fare = calculateDistance(newLocation, rideState.dropoffLocation) * 20 + 30;
         setRideState(prev => ({...prev, estimatedFare: fare}));
       }
    } else if (!rideState.dropoffLocation || rideState.status === 'selectingDropoff') {
      const estimatedFare = calculateDistance(rideState.pickupLocation!, newLocation) * 20 + 30; 
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
      if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation');
      toast({ title: "Dropoff Set", description: "Confirm your ride details." });
    }
  };


  const handleRequestRide = () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation) {
      toast({ title: "Missing Locations", description: "Please select pickup and dropoff points.", variant: "destructive" });
      return;
    }
    setRideState(prev => ({ ...prev, status: 'searching', currentRideId: `ride-sim-${Date.now()}`, currentTriderPathIndex: 0 }));
    toast({ title: "Searching for Trider...", description: "We're finding a TriGo for you." });

    setTimeout(() => {
      const randomTrider = mockTriders[Math.floor(Math.random() * mockTriders.length)];
      setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider: randomTrider }));
      setTriderSimLocation(randomTrider.location);
      if(rideState.pickupLocation) fetchRoute(randomTrider.location, rideState.pickupLocation, 'triderToPickup');
      toast({ title: "Trider Found!", description: `${randomTrider.name} is on the way.` });
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState({
      status: 'idle', pickupLocation: null, dropoffLocation: null, pickupAddress: '', dropoffAddress: '',
      estimatedFare: null, assignedTrider: null, currentRideId: null,
      triderToPickupPath: null, pickupToDropoffPath: null, currentTriderPathIndex: 0,
    });
    setTriderSimLocation(null);
    setEstimatedETA(null);
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setActiveSuggestionBox(null);
    toast({ title: "Ride Cancelled" });
    // Attempt to re-trigger initial geolocation for pickup
    if (navigator.geolocation && MAPBOX_TOKEN) { // Explicitly set status to idle to re-trigger
      setRideState(prev => ({ ...prev, status: 'idle' }));
    }
  };
  
  const handleNewRide = () => handleCancelRide();

  const triderToPickupRouteLayer: any = {
    id: 'trider-to-pickup-route', type: 'line', source: 'trider-to-pickup-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': pickupRouteColor, 'line-width': 6, 'line-opacity': 0.8 },
  };
  const pickupToDropoffRouteLayer: any = {
    id: 'pickup-to-dropoff-route', type: 'line', source: 'pickup-to-dropoff-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': dropoffRouteColor, 'line-width': 6, 'line-opacity': 0.8 },
  };


  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> <p>Loading Passenger Experience...</p></div>;
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
                {rideState.status === 'selectingPickup' && "Set Pickup Location"}
                {rideState.status === 'selectingDropoff' && "Set Dropoff Location"}
                {rideState.status === 'confirmingRide' && "Confirm Your Ride"}
                {rideState.status === 'searching' && "Finding Your TriGo..."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && "Ride In Progress"}
                {rideState.status === 'completed' && "Ride Completed!"}
              </CardTitle>
              <CardDescription>
                {isGeolocating && "Getting your current location for pickup..."}
                {!isGeolocating && rideState.status === 'idle' && "Enter pickup address or click map."}
                {!isGeolocating && (rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff') && "Enter addresses or click map to set points."}
                {rideState.status === 'confirmingRide' && "Review details and request your ride."}
                {rideState.status === 'searching' && "Please wait while we connect you."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && `Your trider ${rideState.assignedTrider?.name} is on the way.`}
                {rideState.status === 'completed' && "Hope you enjoyed your ride!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Label htmlFor="pickup-input">Pickup Location</Label>
                <div className="relative">
                    <Input
                    id="pickup-input"
                    placeholder="Enter pickup address"
                    value={pickupInput}
                    onChange={(e) => { setPickupInput(e.target.value); handleGeocodeSearch(e.target.value, 'pickup'); }}
                    onFocus={() => setActiveSuggestionBox('pickup')}
                    disabled={isGeolocating || (rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff')}
                    />
                    {(isGeolocating || (isSearchingAddress && activeSuggestionBox === 'pickup')) && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground"/>}
                </div>
                {activeSuggestionBox === 'pickup' && pickupSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {pickupSuggestions.map(s => (
                      <li key={s.id} onClick={() => handleSuggestionSelect(s, 'pickup')}
                          className="p-2 hover:bg-accent cursor-pointer text-sm">
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <Label htmlFor="dropoff-input">Dropoff Location</Label>
                 <div className="relative">
                    <Input
                    id="dropoff-input"
                    placeholder="Enter dropoff address"
                    value={dropoffInput}
                    onChange={(e) => { setDropoffInput(e.target.value); handleGeocodeSearch(e.target.value, 'dropoff'); }}
                    onFocus={() => setActiveSuggestionBox('dropoff')}
                    disabled={(rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff')}
                    />
                     {(isSearchingAddress && activeSuggestionBox === 'dropoff') && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground"/>}
                </div>
                 {activeSuggestionBox === 'dropoff' && dropoffSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {dropoffSuggestions.map(s => (
                      <li key={s.id} onClick={() => handleSuggestionSelect(s, 'dropoff')}
                          className="p-2 hover:bg-accent cursor-pointer text-sm">
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {rideState.status === 'confirmingRide' && rideState.estimatedFare && (
                <Alert>
                  <CircleDollarSign className="h-4 w-4" />
                  <AlertTitle>Estimated Fare & ETA</AlertTitle>
                  <AlertDescription>
                    Around ₱{rideState.estimatedFare.toFixed(2)}. ETA: {estimatedETA || 'Calculating...'}. Actuals may vary.
                  </AlertDescription>
                </Alert>
              )}

              {rideState.status === 'searching' && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        <p className="text-sm font-semibold">ETA: {estimatedETA}</p>
                    </div>
                  )}
                </Card>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {rideState.status === 'confirmingRide' && (
                <Button onClick={handleRequestRide} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!rideState.pickupLocation || !rideState.dropoffLocation}>Request TriGo Now</Button>
              )}
              {(rideState.status === 'searching' || rideState.status === 'triderAssigned') && (
                <Button onClick={handleCancelRide} variant="outline" className="w-full">Cancel Ride</Button>
              )}
               {rideState.status === 'completed' && (
                <Button onClick={handleNewRide} className="w-full">Book Another Ride</Button>
              )}
               {(rideState.status === 'idle' || rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
                <Button onClick={handleCancelRide} variant="ghost" className="w-full">Reset / New Ride</Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border">
          <Map
            {...viewState}
            ref={mapRef}
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
                 <div className="p-1.5 rounded-full shadow-md bg-primary text-primary-foreground animate-pulse" title="Your Trider" data-ai-hint="tricycle icon">
                    <Bike size={20} />
                  </div>
              </Marker>
            )}
            {rideState.triderToPickupPath && rideState.status === 'triderAssigned' && (
              <Source id="trider-to-pickup-route" type="geojson" data={{ type: 'Feature', geometry: rideState.triderToPickupPath, properties: {} }}>
                {/* @ts-ignore */}
                <Layer {...triderToPickupRouteLayer} />
              </Source>
            )}
            {rideState.pickupToDropoffPath && (rideState.status === 'inProgress' || rideState.status === 'confirmingRide') && (
              <Source id="pickup-to-dropoff-route" type="geojson" data={{ type: 'Feature', geometry: rideState.pickupToDropoffPath, properties: {} }}>
                {/* @ts-ignore */}
                <Layer {...pickupToDropoffRouteLayer} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
    
