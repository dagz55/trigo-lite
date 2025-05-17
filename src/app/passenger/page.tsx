
"use client";

import * as React from 'react';
import { MapPin, Dot, Search, Bike, User, ArrowRight, CircleDollarSign, Clock, Loader2, Ticket, SettingsIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type { Coordinates, PassengerRideState, TriderProfile, RideRequest, RoutePath, TodaZone, MockPassengerProfile, PassengerSettings, PassengerMapStyle } from "@/types";
import { todaZones as appTodaZones } from "@/data/todaZones";
import { getRandomPointInCircle, calculateDistance, isPointInCircle } from "@/lib/geoUtils";
import { useSettings as useGeneralSettings } from "@/contexts/SettingsContext"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2'; 

const FIREBASE_ORANGE_HSL_STRING = 'hsl(33, 100%, 50%)'; 
const FIREBASE_ORANGE_BORDER_HSL_STRING = 'hsl(33, 100%, 60%)'; 
const NEON_GREEN_TEXT_HSL_STRING = 'hsl(120, 100%, 60%)'; 
const NEON_GREEN_FINAL_COUNTDOWN_HSL_STRING = 'hsl(120, 100%, 75%)';

const DEFAULT_PASSENGER_MAP_STYLE: PassengerMapStyle = 'streets';

const mockTridersForDemo: TriderProfile[] = ['Simon TK', 'Judas Isc. TK', 'Mary M. TK', 'Lazarus TK', 'Martha TK'].map((name, index) => {
  const zone = appTodaZones.find(z => z.id === TALON_KUATRO_ZONE_ID); 
  if (!zone) throw new Error(`Talon Kuatro zone with ID ${TALON_KUATRO_ZONE_ID} not found for mock triders.`);
  return {
    id: `trider-sim-tk-${index + 1}`,
    name: `${name}`,
    location: getRandomPointInCircle(zone.center, zone.radiusKm * 0.5),
    status: 'available',
    vehicleType: 'Tricycle',
    todaZoneId: zone.id,
    todaZoneName: zone.name,
    profilePictureUrl: `https://placehold.co/100x100.png?text=${name.split(' ')[0].charAt(0)}`,
    dataAiHint: "driver portrait",
    wallet: { currentBalance: 100, totalEarnedAllTime: 500, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
    currentPath: null,
    pathIndex: 0,
  };
});

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

export default function PassengerPage() {
  const { 
    defaultMapCenter, 
    defaultMapZoom, 
    isLoading: settingsLoading, 
    getTodaBaseFare, 
    convenienceFee,
    perKmCharge 
  } = useGeneralSettings();
  const { toast } = useToast();

  const [loadedPassengerProfile, setLoadedPassengerProfile] = React.useState<MockPassengerProfile | null>(null);
  const [currentPassengerSettings, setCurrentPassengerSettings] = React.useState<PassengerSettings>({ mapStyle: DEFAULT_PASSENGER_MAP_STYLE });
  const [mapStyleUrl, setMapStyleUrl] = React.useState('mapbox://styles/mapbox/streets-v12');
  const [isRefreshingEta, setIsRefreshingEta] = React.useState(false);

  const [viewState, setViewState] = React.useState({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45, 
  });

  const [rideState, setRideState] = React.useState<PassengerRideState>({
    status: 'idle',
    passengerName: 'Valued Passenger', 
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
    pickupTodaZoneId: null,
    countdownSeconds: null,
    estimatedDurationSeconds: null,
  });

  const [triderSimLocation, setTriderSimLocation] = React.useState<Coordinates | null>(null);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = React.useState(false);

  const [pickupInput, setPickupInput] = React.useState('');
  const [dropoffInput, setDropoffInput] = React.useState('');
  const [pickupSuggestions, setPickupSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = React.useState<'pickup' | 'dropoff' | null>(null);
  
  const [triderToPickupRouteColor, setTriderToPickupRouteColor] = React.useState('hsl(var(--accent))'); 
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(FIREBASE_ORANGE_HSL_STRING);

  const mapRef = React.useRef<MapRef | null>(null);

  const getTodaZoneForLocation = React.useCallback((location: Coordinates): TodaZone | null => {
    for (const zone of appTodaZones) {
      if (isPointInCircle(location, zone.center, zone.radiusKm)) {
        return zone;
      }
    }
    return null;
  }, []);

  const handleStatusToast = React.useCallback((title: string, description: string) => {
    toast({ title, description });
  }, [toast]);

  React.useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('selectedPassengerProfile');
      if (storedProfile) {
        const passenger: MockPassengerProfile = JSON.parse(storedProfile);
        setLoadedPassengerProfile(passenger);
        setRideState(prev => ({ ...prev, passengerName: passenger.name }));

        const storedPassengerSettings = localStorage.getItem(`passengerSettings_${passenger.id}`);
        let pSettings: PassengerSettings = passenger.settings || { mapStyle: DEFAULT_PASSENGER_MAP_STYLE };
        if (storedPassengerSettings) {
          pSettings = { ...pSettings, ...JSON.parse(storedPassengerSettings) };
        }
        setCurrentPassengerSettings(pSettings);
        
        const passengerZone = appTodaZones.find(z => z.id === passenger.todaZoneId);
        if (passengerZone) {
          setViewState(prev => ({ ...prev, ...passengerZone.center, zoom: 15 }));
          const initialPickupLocation = getRandomPointInCircle(passengerZone.center, passengerZone.radiusKm * 0.2);
          setRideState(prev => ({
            ...prev,
            pickupLocation: initialPickupLocation,
            pickupAddress: `${passengerZone.name} area (suggested)`,
            status: 'selectingDropoff',
            pickupTodaZoneId: passengerZone.id,
          }));
          setPickupInput(`${passengerZone.name} area (suggested)`);
        }
        localStorage.removeItem('selectedPassengerProfile'); 
      } else {
        if (navigator.geolocation && MAPBOX_TOKEN && rideState.status === 'idle') {
          performGeolocation();
        }
      }
    } catch (error) {
      console.error("Error loading passenger profile/settings from localStorage:", error);
      if (navigator.geolocation && MAPBOX_TOKEN && rideState.status === 'idle') {
        performGeolocation();
      }
    }
  }, [MAPBOX_TOKEN]); 

  React.useEffect(() => {
    if (loadedPassengerProfile && !settingsLoading) { 
        const passengerZone = appTodaZones.find(z => z.id === loadedPassengerProfile.todaZoneId);
        if (passengerZone) {
             handleStatusToast(`Welcome, ${loadedPassengerProfile.name}!`, `Starting in ${passengerZone.name}. Select your dropoff.`);
        }
    }
  }, [loadedPassengerProfile, settingsLoading, handleStatusToast]);


  React.useEffect(() => {
    switch (currentPassengerSettings.mapStyle) {
      case 'satellite':
        setMapStyleUrl('mapbox://styles/mapbox/satellite-streets-v12');
        break;
      case 'dark':
        setMapStyleUrl('mapbox://styles/mapbox/dark-v11');
        break;
      case 'streets':
      default:
        setMapStyleUrl('mapbox://styles/mapbox/streets-v12');
        break;
    }
  }, [currentPassengerSettings.mapStyle]);

  const handleSavePassengerSettings = () => {
    if (loadedPassengerProfile) {
      try {
        localStorage.setItem(`passengerSettings_${loadedPassengerProfile.id}`, JSON.stringify(currentPassengerSettings));
        handleStatusToast("Settings Saved (Simulation)", "Your preferences have been saved for this demo session.");
      } catch (error) {
        console.error("Error saving passenger settings to localStorage:", error);
        toast({ title: "Save Error", description: "Could not save settings.", variant: "destructive" });
      }
    } else {
       toast({ title: "Cannot Save", description: "No passenger profile loaded to save settings for.", variant: "destructive" });
    }
  };

  const calculateEstimatedFare = React.useCallback((pickupLoc: Coordinates, dropoffLoc: Coordinates, pickupZoneId: string | null): number => {
    if (!pickupLoc || !dropoffLoc || !pickupZoneId) return 0;
    const distance = calculateDistance(pickupLoc, dropoffLoc);
    const todaSpecificBaseFare = getTodaBaseFare(pickupZoneId); // Uses settings context
    const fare = todaSpecificBaseFare + (distance * perKmCharge) + convenienceFee;
    return parseFloat(fare.toFixed(2));
  }, [getTodaBaseFare, perKmCharge, convenienceFee]);


  const performGeolocation = async () => {
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const pickupZone = getTodaZoneForLocation(coords);
        
        try {
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&limit=1`);
          const data = await response.json();
          let address = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
          if (data.features && data.features.length > 0) {
            address = data.features[0].place_name;
          }
          setRideState(prev => ({ ...prev, pickupLocation: coords, pickupAddress: address, status: 'selectingDropoff', pickupTodaZoneId: pickupZone?.id || null }));
          setPickupInput(address);
          handleStatusToast("Current Location Set as Pickup", `Zone: ${pickupZone?.name || 'N/A'}. Now select dropoff.`);
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setRideState(prev => ({ ...prev, pickupLocation: coords, pickupAddress: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, status: 'selectingDropoff', pickupTodaZoneId: pickupZone?.id || null }));
          setPickupInput(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
          handleStatusToast("Current Location Set as Pickup", `Using coordinates (Zone: ${pickupZone?.name || 'N/A'}). Now select dropoff.`);
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
  };


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
      setTriderToPickupRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'lime');
    }
  }, []);


  React.useEffect(() => {
    if (settingsLoading) return;
     if (!loadedPassengerProfile) { 
      setViewState(prev => ({
        ...prev,
        longitude: defaultMapCenter.longitude,
        latitude: defaultMapCenter.latitude,
        zoom: defaultMapZoom + 1,
      }));
    }
  }, [defaultMapCenter, defaultMapZoom, settingsLoading, loadedPassengerProfile]);

  React.useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout;
    if (rideState.countdownSeconds !== null && rideState.countdownSeconds > 0 && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress')) {
      countdownIntervalId = setInterval(() => {
        setRideState(prev => ({ ...prev, countdownSeconds: Math.max(0, (prev.countdownSeconds || 0) - 1) }));
      }, 1000);
    }
    return () => clearInterval(countdownIntervalId);
  }, [rideState.status, rideState.countdownSeconds]);

  React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;

    if (
      ((rideState.status === 'triderAssigned' && rideState.triderToPickupPath) ||
      (rideState.status === 'inProgress' && rideState.pickupToDropoffPath)) &&
      triderSimLocation
    ) {
      moveIntervalId = setInterval(() => {
        setTriderSimLocation(prevLoc => {
          if (!prevLoc) return prevLoc;

          const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
          const targetLocation = rideState.status === 'triderAssigned' ? rideState.pickupLocation : rideState.dropoffLocation;

          if (!currentPath || !targetLocation || rideState.currentTriderPathIndex === undefined) {
            return prevLoc;
          }

          const atDestinationOfSegment = rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

          if (atDestinationOfSegment) {
            clearInterval(moveIntervalId);
            setRideState(rs => ({ ...rs, countdownSeconds: 0 })); 

            if (rideState.status === 'triderAssigned' && rideState.pickupLocation && rideState.dropoffLocation) {
              handleStatusToast("Trider Arrived for Pickup!", `${rideState.assignedTrider?.name} is here. Heading to destination.`);
              setRideState(rs => ({ ...rs, status: 'inProgress', currentTriderPathIndex: 0, triderToPickupPath: null }));
              fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true);
            } else if (rideState.status === 'inProgress') {
              handleStatusToast("Ride Completed!", `You've arrived. Thank you for using TriGo, ${rideState.passengerName}!`);
              setRideState(rs => ({ ...rs, status: 'completed', pickupToDropoffPath: null }));
            }
            return targetLocation; 
          }

          let nextIndex = rideState.currentTriderPathIndex + 1;
          const newCoords = {
            longitude: currentPath.coordinates[nextIndex][0],
            latitude: currentPath.coordinates[nextIndex][1],
          };
          setRideState(rs => ({ ...rs, currentTriderPathIndex: nextIndex }));
          return newCoords;
        });
      }, 2000); 
    }
    return () => clearInterval(moveIntervalId);
  }, [
    rideState.status,
    rideState.triderToPickupPath,
    rideState.pickupToDropoffPath,
    triderSimLocation,
    rideState.currentTriderPathIndex,
    rideState.pickupLocation, // Added
    rideState.dropoffLocation, // Added
    rideState.assignedTrider,
    rideState.passengerName,
    handleStatusToast,
  ]);

  const getRouteDuration = React.useCallback(async (start: Coordinates, end: Coordinates): Promise<number | null> => {
    if (!MAPBOX_TOKEN) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?overview=simplified&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        return Math.round(data.routes[0].duration);
      }
    } catch (error) {
      console.error("Error fetching route duration:", error);
    }
    return null;
  }, []);


  React.useEffect(() => {
    let etaRefreshIntervalId: NodeJS.Timeout;

    if (
      (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') &&
      triderSimLocation &&
      !isRefreshingEta
    ) {
      etaRefreshIntervalId = setInterval(async () => {
        if (!triderSimLocation) return;

        const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
        const atDestinationOfSegment = currentPath && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

        if (atDestinationOfSegment) { 
            setIsRefreshingEta(false);
            return;
        }

        setIsRefreshingEta(true);
        const targetForEta = rideState.status === 'triderAssigned' 
          ? rideState.pickupLocation 
          : rideState.dropoffLocation;

        if (targetForEta) {
          const newDuration = await getRouteDuration(triderSimLocation, targetForEta);
          if (newDuration !== null) {
            setRideState(prev => {
              const stillEnRoute = prev.currentTriderPathIndex !== undefined && 
                                   ((prev.status === 'triderAssigned' && prev.triderToPickupPath && prev.currentTriderPathIndex < prev.triderToPickupPath.coordinates.length -1) ||
                                   (prev.status === 'inProgress' && prev.pickupToDropoffPath && prev.currentTriderPathIndex < prev.pickupToDropoffPath.coordinates.length -1));

              if(stillEnRoute) {
                return {
                  ...prev,
                  estimatedDurationSeconds: newDuration,
                  countdownSeconds: newDuration, 
                }
              }
              return prev;
            });
          }
        }
        setIsRefreshingEta(false);
      }, 7000); 
    }

    return () => {
      clearInterval(etaRefreshIntervalId);
      if (isRefreshingEta) setIsRefreshingEta(false); 
    };
  }, [
    rideState.status,
    triderSimLocation,
    rideState.pickupLocation,
    rideState.dropoffLocation,
    isRefreshingEta,
    getRouteDuration,
    rideState.triderToPickupPath,
    rideState.pickupToDropoffPath,
    rideState.currentTriderPathIndex
  ]);


  const fetchRoute = async (start: Coordinates, end: Coordinates, routeType: 'triderToPickup' | 'pickupToDropoff' | 'confirmation', showToastFeedback: boolean = true) => {
    if (!MAPBOX_TOKEN) return;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&alternatives=true&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      let chosenRoute = null;
      if (data.routes && data.routes.length > 0) {
        if (data.routes.length > 1) {
          chosenRoute = data.routes.reduce((shortest: any, current: any) => 
            current.distance < shortest.distance ? current : shortest
          );
        } else {
          chosenRoute = data.routes[0];
        }

        const routeGeometry: RoutePath = chosenRoute.geometry;
        const durationSeconds = Math.round(chosenRoute.duration);
        
        if (routeType === 'triderToPickup') {
          setRideState(prev => ({ ...prev, triderToPickupPath: routeGeometry, pickupToDropoffPath: null, estimatedDurationSeconds: durationSeconds, countdownSeconds: durationSeconds }));
        } else if (routeType === 'pickupToDropoff') {
          setRideState(prev => ({ ...prev, pickupToDropoffPath: routeGeometry, triderToPickupPath: null, estimatedDurationSeconds: durationSeconds, countdownSeconds: durationSeconds }));
        } else if (routeType === 'confirmation') {
           setRideState(prev => ({ ...prev, pickupToDropoffPath: routeGeometry, triderToPickupPath: null, estimatedDurationSeconds: durationSeconds, countdownSeconds: null }));
        }
        if (showToastFeedback && routeType !== 'confirmation') {
          toast({ title: "Route Updated", description: `Using shortest distance route.` });
        }

      } else {
        setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
        if (showToastFeedback) toast({title: "Route Not Found", description: "Could not calculate route for the selected points.", variant: "destructive"});
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
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
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=PH&limit=5&bbox=120.7,14.2,121.3,14.8`); 
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
    const selectedZone = getTodaZoneForLocation(location);

    if (type === 'pickup') {
      setRideState(prev => ({ ...prev, pickupLocation: location, pickupAddress: suggestion.place_name, status: prev.dropoffLocation ? 'confirmingRide' : 'selectingDropoff', pickupTodaZoneId: selectedZone?.id || null }));
      setPickupInput(suggestion.place_name);
      setPickupSuggestions([]);
      handleStatusToast("Pickup Set", `Zone: ${selectedZone?.name || 'N/A'}. Now select dropoff.`);
      if (rideState.dropoffLocation) {
        const fare = calculateEstimatedFare(location, rideState.dropoffLocation, selectedZone?.id || null);
        fetchRoute(location, rideState.dropoffLocation, 'confirmation');
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    } else {
      setRideState(prev => ({ ...prev, dropoffLocation: location, dropoffAddress: suggestion.place_name, status: prev.pickupLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setDropoffInput(suggestion.place_name);
      setDropoffSuggestions([]);
      handleStatusToast("Dropoff Set", "Review details and confirm.");
      if (rideState.pickupLocation) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, location, rideState.pickupTodaZoneId);
        fetchRoute(rideState.pickupLocation, location, 'confirmation');
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    }
    setViewState(prev => ({ ...prev, ...location, zoom: 15 }));
    setActiveSuggestionBox(null);
  };
  
  const handleMapClick = (event: mapboxgl.MapLayerMouseEvent) => {
    if (isSearchingAddress || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress' || rideState.status === 'completed' ) return; 
    const { lngLat } = event;
    const newLocation = { longitude: lngLat.lng, latitude: lngLat.lat };
    const newAddress = `Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`;
    const clickedZone = getTodaZoneForLocation(newLocation);

    if (!rideState.pickupLocation || rideState.status === 'selectingPickup' ) {
      setRideState(prev => ({ ...prev, status: 'selectingDropoff', pickupLocation: newLocation, pickupAddress: newAddress, pickupTodaZoneId: clickedZone?.id || null }));
      setPickupInput(newAddress);
      setPickupSuggestions([]);
      handleStatusToast("Pickup Set by Map Click", `Zone: ${clickedZone?.name || 'N/A'}. Now select your dropoff location.`);
       if (rideState.dropoffLocation) {
         const fare = calculateEstimatedFare(newLocation, rideState.dropoffLocation, clickedZone?.id || null);
         fetchRoute(newLocation, rideState.dropoffLocation, 'confirmation');
         setRideState(prev => ({...prev, estimatedFare: fare}));
       }
    } else if (!rideState.dropoffLocation || rideState.status === 'selectingDropoff') {
      if (!rideState.pickupLocation) return; 
      const fare = calculateEstimatedFare(rideState.pickupLocation, newLocation, rideState.pickupTodaZoneId);
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare: fare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
      if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation');
      handleStatusToast("Dropoff Set by Map Click", "Confirm your ride details.");
    }
  };

  const handleRequestRide = () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation) {
      toast({ title: "Missing Locations", description: "Please select pickup and dropoff points.", variant: "destructive" });
      return;
    }
    if (!rideState.pickupTodaZoneId) {
      toast({ title: "Pickup Outside Zone", description: "Your selected pickup location is not within a serviceable TODA zone.", variant: "destructive" });
      return;
    }
    
    const passengerPickupZone = appTodaZones.find(z => z.id === rideState.pickupTodaZoneId);
    if (!passengerPickupZone) {
      toast({ title: "Invalid Pickup Zone", description: "Cannot find details for the pickup zone.", variant: "destructive" });
      return;
    }

    setRideState(prev => ({ ...prev, status: 'searching', currentRideId: `TKT-${Date.now()}`, currentTriderPathIndex: 0 }));
    handleStatusToast("Searching for Trider...", `We're finding a TriGo for you in ${passengerPickupZone.name}.`);

    setTimeout(() => {
      const availableTridersInZone = mockTridersForDemo.filter(t => t.todaZoneId === rideState.pickupTodaZoneId || t.todaZoneId === TALON_KUATRO_ZONE_ID); 
      if(availableTridersInZone.length === 0){
        setRideState(prev => ({ ...prev, status: 'idle' })); 
        toast({ title: "No Triders Available", description: `Sorry, no triders currently available in ${passengerPickupZone.name}. Please try again later.`, variant: "destructive"});
        return;
      }
      const randomTrider = availableTridersInZone[Math.floor(Math.random() * availableTridersInZone.length)];
      
      setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider: randomTrider }));
      setTriderSimLocation(randomTrider.location); 
      if(rideState.pickupLocation) fetchRoute(randomTrider.location, rideState.pickupLocation, 'triderToPickup', true);
      handleStatusToast("Trider Found!", `${randomTrider.name} (${randomTrider.todaZoneName}) is on the way.`);
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState({
      status: 'idle', 
      passengerName: loadedPassengerProfile?.name || 'Valued Passenger', 
      pickupLocation: null, dropoffLocation: null, pickupAddress: '', dropoffAddress: '',
      estimatedFare: null, assignedTrider: null, currentRideId: null,
      triderToPickupPath: null, pickupToDropoffPath: null, currentTriderPathIndex: 0, pickupTodaZoneId: null,
      countdownSeconds: null, estimatedDurationSeconds: null,
    });
    setTriderSimLocation(null);
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setActiveSuggestionBox(null);
    toast({ title: "Ride Cancelled" });
    if (loadedPassengerProfile) {
        const passengerZone = appTodaZones.find(z => z.id === loadedPassengerProfile.todaZoneId);
        if (passengerZone) {
            setViewState(prev => ({ ...prev, ...passengerZone.center, zoom: 15 }));
        }
    } else if (navigator.geolocation && MAPBOX_TOKEN) { 
      performGeolocation(); 
    }
  };
  
  const handleNewRide = () => handleCancelRide(); 

  const formatCountdown = (seconds: number | null): string => {
    if (seconds === null || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const triderToPickupRouteLayer: any = {
    id: 'trider-to-pickup-route', type: 'line', source: 'trider-to-pickup-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': triderToPickupRouteColor, 'line-width': 6, 'line-opacity': 0.8 },
  };
  const pickupToDropoffRouteLayer: any = {
    id: 'pickup-to-dropoff-route', type: 'line', source: 'pickup-to-dropoff-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': pickupToDropoffRouteColor, 'line-width': 6, 'line-opacity': 0.8 },
  };


  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> <p>Loading Passenger Experience...</p></div>;
  }

  const countdownColorStyle = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 ? { color: NEON_GREEN_FINAL_COUNTDOWN_HSL_STRING } : { color: NEON_GREEN_TEXT_HSL_STRING };
  if (rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 && rideState.countdownSeconds > 0) {
    console.log(`Playing countdown sound: ${rideState.countdownSeconds}`); 
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm">
        <h1 className="text-2xl font-semibold flex items-center" style={{ color: FIREBASE_ORANGE_HSL_STRING }}>
          <User className="mr-2" /> TriGo Passenger ({rideState.passengerName})
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
                {!isGeolocating && rideState.status === 'idle' && "Enter pickup or click map."}
                {!isGeolocating && (rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff') && "Enter addresses or click map to set points."}
                {rideState.status === 'confirmingRide' && `Pickup Zone: ${appTodaZones.find(z=>z.id === rideState.pickupTodaZoneId)?.name || 'N/A'}. Review details.`}
                {rideState.status === 'searching' && "Please wait while we connect you."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && `Your trider ${rideState.assignedTrider?.name} is on the way.`}
                {rideState.status === 'completed' && "Hope you enjoyed your ride!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
            {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.currentRideId && (
                <Alert variant="default" style={{ borderColor: FIREBASE_ORANGE_BORDER_HSL_STRING }} className="bg-black/20 backdrop-blur-sm">
                    <Ticket className="h-5 w-5" style={{ color: FIREBASE_ORANGE_HSL_STRING }} />
                    <AlertTitle className="font-semibold" style={{ color: FIREBASE_ORANGE_HSL_STRING }}>Ride Ticket #: {rideState.currentRideId}</AlertTitle>
                    {rideState.countdownSeconds !== null && rideState.estimatedDurationSeconds !== null && (
                         <div className="mt-2 p-3 rounded-lg bg-black/70 backdrop-blur-sm border border-lime-500/50 shadow-lg">
                            <p className={`text-3xl font-mono text-center ${rideState.countdownSeconds <= 10 && rideState.countdownSeconds > 0 ? 'animate-pulse' : ''}`} style={countdownColorStyle}>
                                {formatCountdown(rideState.countdownSeconds)}
                            </p>
                            <p className="text-xs text-lime-200/80 text-center mt-1">
                                Estimated {rideState.status === 'triderAssigned' ? 'Arrival at Pickup' : 'Arrival at Destination'}
                            </p>
                        </div>
                    )}
                </Alert>
            )}
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
                  <AlertTitle>Estimated Fare & Duration</AlertTitle>
                  <AlertDescription>
                    Around ₱{rideState.estimatedFare.toFixed(2)}. Trip Time: {formatCountdown(rideState.estimatedDurationSeconds)}. Actuals may vary.
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
                      {rideState.assignedTrider.profilePictureUrl && <AvatarImage src={rideState.assignedTrider.profilePictureUrl} data-ai-hint={rideState.assignedTrider.dataAiHint || "driver person"}/>}
                      <AvatarFallback>{rideState.assignedTrider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{rideState.assignedTrider.name}</p>
                      <p className="text-xs text-muted-foreground">{rideState.assignedTrider.vehicleType} - {rideState.assignedTrider.todaZoneName}</p>
                      <p className="text-xs font-medium mt-0.5">Status: {rideState.status === 'triderAssigned' ? 'En Route to Pickup' : 'On Trip to Destination'}</p>
                    </div>
                  </div>
                </Card>
              )}
              {loadedPassengerProfile && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <SettingsIcon className="mr-2 h-4 w-4" /> My Settings
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div>
                        <Label htmlFor="map-style-select">Preferred Map Style</Label>
                        <Select
                          value={currentPassengerSettings.mapStyle}
                          onValueChange={(value) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value as PassengerMapStyle }))}
                        >
                          <SelectTrigger id="map-style-select">
                            <SelectValue placeholder="Select map style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="streets">Streets</SelectItem>
                            <SelectItem value="satellite">Satellite</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSavePassengerSettings} size="sm" className="w-full">Save My Settings</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {rideState.status === 'confirmingRide' && (
                <Button onClick={handleRequestRide} className="w-full text-white" style={{ backgroundColor: FIREBASE_ORANGE_HSL_STRING }} disabled={!rideState.pickupLocation || !rideState.dropoffLocation || !rideState.pickupTodaZoneId}>Request TriGo Now</Button>
              )}
              {(rideState.status === 'searching' || rideState.status === 'triderAssigned') && (
                <Button onClick={handleCancelRide} variant="outline" className="w-full">Cancel Ride</Button>
              )}
               {rideState.status === 'completed' && (
                <Button onClick={handleNewRide} className="w-full text-white" style={{ backgroundColor: FIREBASE_ORANGE_HSL_STRING }}>Book Another Ride</Button>
              )}
               {(rideState.status === 'idle' || rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && rideState.status !== 'completed' && ( 
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
            mapStyle={mapStyleUrl} 
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
                <Layer {...triderToPickupRouteLayer} />
              </Source>
            )}
            {rideState.pickupToDropoffPath && (rideState.status === 'inProgress' || rideState.status === 'confirmingRide') && (
              <Source id="pickup-to-dropoff-route" type="geojson" data={{ type: 'Feature', geometry: rideState.pickupToDropoffPath, properties: {} }}>
                <Layer {...pickupToDropoffRouteLayer} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
