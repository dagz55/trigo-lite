"use client";

import { RideReceiptDialog } from '@/components/passenger/RideReceiptDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings as useGeneralSettings } from "@/contexts/SettingsContext";
import { todaZones as appTodaZones } from "@/data/todaZones";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, getRandomPointInCircle, isPointInCircle } from "@/lib/geoUtils";
import type {
  Coordinates,
  MockPassengerProfile,
  PassengerMapStyle,
  PassengerRideState,
  PassengerSettings,
  RoutePath,
  TodaZone,
  TriderProfile
} from "@/types";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import {
  Bike,
  CircleDollarSign,
  Crosshair,
  Gem,
  LayoutDashboard,
  Loader2,
  LogIn as LogInIcon,
  MapPin,
  SettingsIcon,
  Ticket,
  User,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import Map, { Layer, MapRef, Marker, NavigationControl, Source } from 'react-map-gl';
import styles from './passenger.module.css';

const TALON_KUATRO_ZONE_ID = '2'; 

const REDHAT_RED_COLOR_BUTTON_BG = '#EE0000'; 
const REDHAT_RED_COLOR_ACCENT = 'hsl(0, 87%, 46%)'; 
const PASSENGER_HEADER_BG = '#1A1A1A'; 
const PASSENGER_HEADER_TEXT = '#FFFFFF'; 
const PASSENGER_INPUT_TEXT_COLOR = 'text-neutral-100'; // For dark input backgrounds

const DEFAULT_PASSENGER_MAP_STYLE: PassengerMapStyle = 'streets';

const mockTridersForDemo: TriderProfile[] = [
  'Simon TK', 'Judas Isc. TK', 'Mary M. TK', 'Lazarus TK', 'Martha TK'
].map((name, index) => {
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
    dataAiHint: "driver person",
    wallet: {
      currentBalance: 100,
      totalEarnedAllTime: 500,
      todayTotalRides: 0,
      todayTotalFareCollected: 0,
      todayNetEarnings: 0,
      todayTotalCommission: 0,
      paymentLogs: [],
      recentRides: []
    },
    currentPath: null,
    pathIndex: 0,
  };
});

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

const TriGoPassengerLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="13" stroke={REDHAT_RED_COLOR_ACCENT} strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <path d="M M9.5 12 Q16 8 22.5 12 L19.5 12" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
    <circle cx="17" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
  </svg>
);


export default function PassengerPage() {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const { 
    defaultMapCenter, 
    defaultMapZoom, 
    isLoading: settingsLoading, 
    getTodaBaseFare, 
    convenienceFee,
    perKmCharge,
  } = useGeneralSettings();
  const { toast } = useToast();
  const { user } = useUser();

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
    passengerName: user?.fullName || user?.firstName || 'Valued Passenger', 
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
    completionTime: undefined,
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
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(REDHAT_RED_COLOR_ACCENT);

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
  const [completedRideDetails, setCompletedRideDetails] = React.useState<PassengerRideState | null>(null);

  const mapRef = React.useRef<MapRef | null>(null);
  const toastShownForStatus = React.useRef<Record<string, boolean>>({});

  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const computedStyles = getComputedStyle(document.documentElement);
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
        const accentColorVar = computedStyles.getPropertyValue('--accent').trim();
        setTriderToPickupRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'green'); // Keep trider to pickup as accent (lime green)
    }
  }, []);

  // Update passenger name when user changes
  React.useEffect(() => {
    if (user) {
      setRideState(prev => ({
        ...prev,
        passengerName: user.fullName || user.firstName || 'Valued Passenger'
      }));
    }
  }, [user]);

  const getTodaZoneForLocation = React.useCallback((location: Coordinates): TodaZone | null => {
    for (const zone of appTodaZones) {
      if (isPointInCircle(location, zone.center, zone.radiusKm)) {
        return zone;
      }
    }
    return null;
  }, []);

  const handleStatusToast = React.useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({ title, description, variant });
  }, [toast]);

  const performGeolocation = React.useCallback(async () => {
    if (!navigator.geolocation || !MAPBOX_TOKEN) {
        handleStatusToast("Geolocation Unavailable", "Your browser does not support geolocation or Mapbox token is missing.", "destructive");
        return;
    }
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
        handleStatusToast("Geolocation Failed", "Could not get current location. Please set pickup manually.", "destructive");
        setRideState(prev => ({ ...prev, status: 'selectingPickup' })); 
        setIsGeolocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [getTodaZoneForLocation, handleStatusToast]);

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
      }
    } catch (error) {
      console.error("Error loading passenger profile/settings from localStorage:", error);
    }
  }, []); 

  React.useEffect(() => {
    if (loadedPassengerProfile && !settingsLoading && !toastShownForStatus.current[`welcome-${loadedPassengerProfile.id}`]) { 
        const passengerZone = appTodaZones.find(z => z.id === loadedPassengerProfile.todaZoneId);
        if (passengerZone) {
             handleStatusToast(`Welcome, ${loadedPassengerProfile.name}!`, `Starting in ${passengerZone.name}. Select your pickup & dropoff.`);
             toastShownForStatus.current[`welcome-${loadedPassengerProfile.id}`] = true;
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
        handleStatusToast("Save Error", "Could not save settings.", "destructive");
      }
    } else {
       handleStatusToast("Cannot Save", "No passenger profile loaded to save settings for.", "destructive");
    }
  };

  const calculateEstimatedFare = React.useCallback((pickupLoc: Coordinates, dropoffLoc: Coordinates, pickupZoneId: string | null): number => {
    if (!pickupLoc || !dropoffLoc || !pickupZoneId) return 0;
    const distance = calculateDistance(pickupLoc, dropoffLoc);
    const base = getTodaBaseFare(pickupZoneId); 
    const fare = base + (distance * perKmCharge) + convenienceFee;
    return parseFloat(fare.toFixed(2));
  }, [getTodaBaseFare, perKmCharge, convenienceFee]);


  React.useEffect(() => {
    if (settingsLoading) return;
     if (!loadedPassengerProfile && rideState.status === 'idle' && !rideState.pickupLocation) { 
      setViewState(prev => ({
        ...prev,
        longitude: defaultMapCenter.longitude,
        latitude: defaultMapCenter.latitude,
        zoom: defaultMapZoom + 1,
      }));
    }
  }, [defaultMapCenter, defaultMapZoom, settingsLoading, loadedPassengerProfile, rideState.status, rideState.pickupLocation]);

  React.useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout;
    if (rideState.countdownSeconds !== null && rideState.countdownSeconds > 0 && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress')) {
      countdownIntervalId = setInterval(() => {
        setRideState(prev => ({ ...prev, countdownSeconds: Math.max(0, (prev.countdownSeconds || 0) - 1) }));
      }, 1000);
    }
    return () => clearInterval(countdownIntervalId);
  }, [rideState.status, rideState.countdownSeconds]);


  const fetchRoute = React.useCallback(async (start: Coordinates, end: Coordinates, routeType: 'triderToPickup' | 'pickupToDropoff' | 'confirmation', showToastFeedback: boolean = true): Promise<RoutePath | null> => {
    if (!MAPBOX_TOKEN) return null;
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
           if (showToastFeedback) handleStatusToast("Route Updated (Shortest Distance)", `Using shortest of ${data.routes.length} alternatives.`);
        } else {
          chosenRoute = data.routes[0];
        }

        const routeGeometry: RoutePath = chosenRoute.geometry;
        const durationSeconds = Math.round(chosenRoute.duration);
        
        if (routeType === 'triderToPickup') {
          setRideState(prev => ({
            ...prev,
            triderToPickupPath: routeGeometry,
            pickupToDropoffPath: null, 
            estimatedDurationSeconds: durationSeconds,
            countdownSeconds: durationSeconds
          }));
        } else if (routeType === 'pickupToDropoff') {
          setRideState(prev => ({
            ...prev,
            pickupToDropoffPath: routeGeometry,
            triderToPickupPath: null, 
            estimatedDurationSeconds: durationSeconds,
            countdownSeconds: durationSeconds
          }));
        } else if (routeType === 'confirmation') {
           setRideState(prev => ({
             ...prev,
             pickupToDropoffPath: routeGeometry, 
             triderToPickupPath: null,
             estimatedDurationSeconds: durationSeconds,
             countdownSeconds: null 
           }));
        }
        if (showToastFeedback && routeType !== 'confirmation' && chosenRoute) {
           handleStatusToast(`Route Updated (${routeType === 'triderToPickup' ? 'To Pickup' : 'To Dropoff'})`, `ETA: ${formatCountdown(durationSeconds)}`);
        }
        return routeGeometry;
      } else {
        setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
        if (showToastFeedback) handleStatusToast("Route Not Found", "Could not calculate route for the selected points.", "destructive");
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
      if (showToastFeedback) handleStatusToast("Route Error", "Failed to fetch route information.", "destructive");
    }
    return null;
  }, [MAPBOX_TOKEN, handleStatusToast]);

 React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;

    if (
      triderSimLocation && rideState.pickupLocation && rideState.dropoffLocation &&
      ((rideState.status === 'triderAssigned' && rideState.triderToPickupPath) ||
       (rideState.status === 'inProgress' && rideState.pickupToDropoffPath))
    ) {
      moveIntervalId = setInterval(() => {
        setTriderSimLocation(prevLoc => {
          if (!prevLoc) return prevLoc;

          const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
          const targetLocation = rideState.status === 'triderAssigned' ? rideState.pickupLocation! : rideState.dropoffLocation!;
          
          if (!currentPath || !targetLocation || rideState.currentTriderPathIndex === undefined) return prevLoc;
          
          const atDestinationOfSegment = rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

          if (atDestinationOfSegment) {
            setRideState(prev => ({ ...prev, countdownSeconds: 0 })); // Set countdown to 0 on arrival
            if (prevLoc.longitude !== targetLocation.longitude || prevLoc.latitude !== targetLocation.latitude) {
                return targetLocation; // Snap to exact target
            }
            return prevLoc; // Already at target
          }

          let nextIndex = rideState.currentTriderPathIndex + 1;
          const newCoords = {
            longitude: currentPath.coordinates[nextIndex][0],
            latitude: currentPath.coordinates[nextIndex][1],
          };
          setRideState(prev => ({ ...prev, currentTriderPathIndex: nextIndex }));
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
    rideState.pickupLocation,
    rideState.dropoffLocation
  ]);
  
 React.useEffect(() => {
    const currentStatus = rideState.status;
    const rideId = rideState.currentRideId || 'ride'; 

    if (currentStatus === 'triderAssigned' && triderSimLocation && rideState.pickupLocation &&
        rideState.currentTriderPathIndex !== undefined && rideState.triderToPickupPath &&
        rideState.currentTriderPathIndex >= rideState.triderToPickupPath.coordinates.length - 1) {
      
      if (!toastShownForStatus.current[`arrived-pickup-${rideId}`]) {
          handleStatusToast("Trider Arrived for Pickup!", `${rideState.assignedTrider?.name} is here. Heading to destination.`);
          toastShownForStatus.current[`arrived-pickup-${rideId}`] = true;
      }
      if (rideState.dropoffLocation) {
          setRideState(prev => ({ ...prev, status: 'inProgress', currentTriderPathIndex: 0, triderToPickupPath: null }));
          fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true);
      }
    } else if (currentStatus === 'inProgress' && triderSimLocation && rideState.dropoffLocation &&
               rideState.currentTriderPathIndex !== undefined && rideState.pickupToDropoffPath &&
               rideState.currentTriderPathIndex >= rideState.pickupToDropoffPath.coordinates.length - 1) {
      if (!toastShownForStatus.current[`completed-${rideId}`]) {
          handleStatusToast("Ride Completed!", `You've arrived. Thank you for using TriGo, ${rideState.passengerName}!`);
          toastShownForStatus.current[`completed-${rideId}`] = true;
      }
      const now = new Date();
      setRideState(prev => ({ ...prev, status: 'completed', pickupToDropoffPath: null, completionTime: now }));
      setCompletedRideDetails(prevRideState => ({...prevRideState!, ...rideState, status: 'completed', completionTime: now}));
      console.log("Simulating: Ride completed. Receipt data to save:", {...rideState, status: 'completed', completionTime: now});
      setIsReceiptDialogOpen(true);
    }
  }, [rideState, triderSimLocation, fetchRoute, handleStatusToast]);


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
  }, [MAPBOX_TOKEN]);


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
      handleStatusToast("Address Search Error", "Could not fetch address suggestions.", "destructive");
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
        fetchRoute(location, rideState.dropoffLocation, 'confirmation', false);
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    } else {
      setRideState(prev => ({ ...prev, dropoffLocation: location, dropoffAddress: suggestion.place_name, status: prev.pickupLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setDropoffInput(suggestion.place_name);
      setDropoffSuggestions([]);
      handleStatusToast("Dropoff Set", "Review details and confirm.");
      if (rideState.pickupLocation) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, location, rideState.pickupTodaZoneId);
        fetchRoute(rideState.pickupLocation, location, 'confirmation', false);
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
         fetchRoute(newLocation, rideState.dropoffLocation, 'confirmation', false);
         setRideState(prev => ({...prev, estimatedFare: fare}));
       }
    } else if (!rideState.dropoffLocation || rideState.status === 'selectingDropoff') {
      if (!rideState.pickupLocation) return; 
      const fare = calculateEstimatedFare(rideState.pickupLocation, newLocation, rideState.pickupTodaZoneId);
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare: fare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
      if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation', false);
      handleStatusToast("Dropoff Set by Map Click", "Confirm your ride details.");
    }
  };

  const handleRequestRide = () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation) {
      handleStatusToast("Missing Locations", "Please select pickup and dropoff points.", "destructive");
      return;
    }
    if (!rideState.pickupTodaZoneId) {
      handleStatusToast("Pickup Outside Zone", "Your selected pickup location is not within a serviceable TODA zone.", "destructive");
      return;
    }
    
    const passengerPickupZone = appTodaZones.find(z => z.id === rideState.pickupTodaZoneId);
    if (!passengerPickupZone) {
      handleStatusToast("Invalid Pickup Zone", "Cannot find details for the pickup zone.", "destructive");
      return;
    }

    setRideState(prev => ({ ...prev, status: 'searching', currentRideId: `TKT-${Date.now()}`, currentTriderPathIndex: 0 }));
    handleStatusToast("Searching for Trider...", `We're finding a TriGo for you in ${passengerPickupZone.name}.`);
    toastShownForStatus.current = {}; // Reset toast flags for new ride

    setTimeout(async () => {
      const availableTridersInZone = mockTridersForDemo.filter(t => t.todaZoneId === rideState.pickupTodaZoneId || t.todaZoneId === TALON_KUATRO_ZONE_ID); 
      if(availableTridersInZone.length === 0){
        setRideState(prev => ({ ...prev, status: 'idle' })); 
        handleStatusToast("No Triders Available", `Sorry, no triders currently available in ${passengerPickupZone.name}. Please try again later.`, "destructive");
        return;
      }
      const randomTrider = availableTridersInZone[Math.floor(Math.random() * availableTridersInZone.length)];
      
      setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider: randomTrider }));
      setTriderSimLocation(randomTrider.location); 
      if(rideState.pickupLocation) {
        await fetchRoute(randomTrider.location, rideState.pickupLocation, 'triderToPickup', true);
      }
      handleStatusToast("Trider Found!", `${randomTrider.name} (${randomTrider.todaZoneName}) is on the way.`);
    }, 3000);
  };

  const handleCancelRide = React.useCallback(() => {
    setRideState({
      status: 'idle', 
      passengerName: loadedPassengerProfile?.name || 'Valued Passenger', 
      pickupLocation: null, dropoffLocation: null, pickupAddress: '', dropoffAddress: '',
      estimatedFare: null, assignedTrider: null, currentRideId: null,
      triderToPickupPath: null, pickupToDropoffPath: null, currentTriderPathIndex: 0, pickupTodaZoneId: null,
      countdownSeconds: null, estimatedDurationSeconds: null, completionTime: undefined,
    });
    setTriderSimLocation(null);
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setActiveSuggestionBox(null);
    toastShownForStatus.current = {};
    setIsReceiptDialogOpen(false);
    setCompletedRideDetails(null);
    handleStatusToast("Ride Cancelled", "");
    if (loadedPassengerProfile) {
        const passengerZone = appTodaZones.find(z => z.id === loadedPassengerProfile.todaZoneId);
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
    }
  }, [loadedPassengerProfile, handleStatusToast]);
  
  // Early return must be placed after ALL hooks including useCallback
  if (settingsLoading || !MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        <Loader2
          className="h-8 w-8 animate-spin mr-2"
          style={{ color: REDHAT_RED_COLOR_ACCENT }}
        />
        <p>Loading Passenger Experience...</p>
      </div>
    );
  }
  
  const handleNewRide = () => {
    setIsReceiptDialogOpen(false); 
    setCompletedRideDetails(null);
    handleCancelRide(); 
  }

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

  const isFinalCountdown = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 && rideState.countdownSeconds > 0;
  const countdownColorStyle = { color: PASSENGER_HEADER_TEXT }; // Always white text for countdown digits
  const countdownPulseClass = isFinalCountdown ? 'animate-pulse font-bold' : '';

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <header className={`p-4 shadow-md flex justify-between items-center ${styles.passengerHeader}`}>
        <div className="flex items-center gap-2">
            <TriGoPassengerLogo />
            <h1 className={`text-xl font-semibold ${styles.redAccent}`}>
                TriGo Passenger
            </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hover:text-neutral-300 flex flex-col items-center">
                  <LogInIcon size={18}/>
                  <span className="text-xs">Log In</span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 md:p-4 overflow-hidden">
        <div className="md:col-span-1 flex flex-col gap-4 p-4 md:p-0 h-full overflow-y-auto">
          <Card className="shadow-lg bg-white border-neutral-200">
            <CardHeader className="border-b border-neutral-200">
              <CardTitle className="text-black">
                {rideState.status === 'idle' && "Plan Your Ride"}
                {rideState.status === 'selectingPickup' && "Set Pickup Location"}
                {rideState.status === 'selectingDropoff' && "Set Dropoff Location"}
                {rideState.status === 'confirmingRide' && "Confirm Your Ride"}
                {rideState.status === 'searching' && "Finding Your TriGo..."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && "Ride In Progress"}
                {rideState.status === 'completed' && "Ride Completed!"}
              </CardTitle>
              <CardDescription className="text-neutral-600">
                {isGeolocating && "Getting your current location for pickup..."}
                {!isGeolocating && rideState.status === 'idle' && "Enter pickup or click map."}
                {!isGeolocating && (rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff') && "Enter addresses or click map to set points."}
                {rideState.status === 'confirmingRide' && `Pickup Zone: ${appTodaZones.find(z=>z.id === rideState.pickupTodaZoneId)?.name || 'N/A'}. Review details.`}
                {rideState.status === 'searching' && "Please wait while we connect you."}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && `Your trider ${rideState.assignedTrider.name} is on the way.`}
                {rideState.status === 'completed' && "Hope you enjoyed your ride!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
            {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.currentRideId && (
                <Alert variant="default" className="bg-neutral-800 border-red-500 text-neutral-100 shadow-xl p-4 rounded-lg">
                    <Ticket className="h-5 w-5 text-white" />
                    <AlertTitle className="font-semibold text-white">Ride Ticket #: {rideState.currentRideId}</AlertTitle>
                    {rideState.countdownSeconds !== null && rideState.estimatedDurationSeconds !== null && (
                         <div className="mt-2 p-3 rounded-lg shadow-inner bg-black/70 backdrop-blur-sm">
                            <p className={`text-3xl font-mono text-center ${countdownPulseClass}`} style={countdownColorStyle}>
                                {formatCountdown(rideState.countdownSeconds)}
                            </p>
                            <p className="text-xs text-neutral-300 text-center mt-1">
                                Estimated {rideState.status === 'triderAssigned' ? 'Arrival at Pickup' : 'Arrival at Destination'}
                            </p>
                        </div>
                    )}
                </Alert>
            )}
              <div className="space-y-1">
                <Label htmlFor="pickup-input" className="text-neutral-700">Pickup Location</Label>
                <div className="relative flex items-center">
                    <Input
                      id="pickup-input"
                      placeholder="Enter pickup address"
                      value={pickupInput}
                      onChange={(e) => { setPickupInput(e.target.value); handleGeocodeSearch(e.target.value, 'pickup'); }}
                      onFocus={() => setActiveSuggestionBox('pickup')}
                      disabled={isGeolocating || (rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff')}
                      className={`pr-10 border-neutral-300 focus:border-red-500 focus:ring-red-500 ${PASSENGER_INPUT_TEXT_COLOR} placeholder:text-neutral-400`}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-neutral-400 hover:text-neutral-100"
                      onClick={performGeolocation}
                      disabled={isGeolocating}
                      aria-label="Locate Me"
                    >
                      {isGeolocating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Crosshair className="h-5 w-5" />}
                    </Button>
                </div>
                {activeSuggestionBox === 'pickup' && pickupSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {pickupSuggestions.map(s => (
                      <li key={s.id} onClick={() => handleSuggestionSelect(s, 'pickup')}
                          className={`p-2 hover:bg-neutral-700 cursor-pointer text-sm ${PASSENGER_INPUT_TEXT_COLOR}`}>
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="dropoff-input" className="text-neutral-700">Dropoff Location</Label>
                 <div className="relative">
                    <Input
                    id="dropoff-input"
                    placeholder="Enter dropoff address"
                    value={dropoffInput}
                    onChange={(e) => { setDropoffInput(e.target.value); handleGeocodeSearch(e.target.value, 'dropoff'); }}
                    onFocus={() => setActiveSuggestionBox('dropoff')}
                    disabled={(rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff')}
                    className={`border-neutral-300 focus:border-red-500 focus:ring-red-500 ${PASSENGER_INPUT_TEXT_COLOR} placeholder:text-neutral-400`}
                    />
                     {(isSearchingAddress && activeSuggestionBox === 'dropoff') && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-neutral-400"/>}
                </div>
                 {activeSuggestionBox === 'dropoff' && dropoffSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {dropoffSuggestions.map(s => (
                      <li key={s.id} onClick={() => handleSuggestionSelect(s, 'dropoff')}
                          className={`p-2 hover:bg-neutral-700 cursor-pointer text-sm ${PASSENGER_INPUT_TEXT_COLOR}`}>
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {rideState.status === 'confirmingRide' && rideState.estimatedFare !== null && rideState.estimatedDurationSeconds !== null && (
                <Alert className="bg-red-50 border-red-200 text-red-700">
                  <CircleDollarSign className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-700">Estimated Fare & Duration</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Around ₱{rideState.estimatedFare.toFixed(2)}. Trip Time: {formatCountdown(rideState.estimatedDurationSeconds)}. Actuals may vary.
                  </AlertDescription>
                </Alert>
              )}

              {rideState.status === 'searching' && (
                <div className="flex items-center justify-center py-4 text-black">
                  <Loader2 className="h-8 w-8 animate-spin" style={{color: REDHAT_RED_COLOR_ACCENT}} />
                  <p className="ml-2">Looking for available triders...</p>
                </div>
              )}

              {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                <Card className="bg-neutral-100 p-3 border-neutral-200 text-black">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {rideState.assignedTrider.profilePictureUrl && <AvatarImage src={rideState.assignedTrider.profilePictureUrl} data-ai-hint={rideState.assignedTrider.dataAiHint || "driver person"}/>}
                      <AvatarFallback>{rideState.assignedTrider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{rideState.assignedTrider.name}</p>
                      <p className="text-xs text-neutral-500">{rideState.assignedTrider.vehicleType} - {rideState.assignedTrider.todaZoneName}</p>
                      <p className="text-xs font-medium mt-0.5">Status: {rideState.status === 'triderAssigned' ? 'En Route to Pickup' : 'On Trip to Destination'}</p>
                    </div>
                  </div>
                </Card>
              )}
              {loadedPassengerProfile && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-neutral-200">
                    <AccordionTrigger className="text-neutral-700 hover:text-red-600">
                      <SettingsIcon className="mr-2 h-4 w-4" /> My Settings
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div>
                        <Label htmlFor="map-style-select" className="text-neutral-700">Preferred Map Style</Label>
                        <Select
                          value={currentPassengerSettings.mapStyle}
                          onValueChange={(value) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value as PassengerMapStyle }))}
                        >
                          <SelectTrigger id="map-style-select" className="border-neutral-300 text-black data-[placeholder]:text-neutral-400">
                            <SelectValue placeholder="Select map style" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-neutral-300 text-black">
                            <SelectItem value="streets" className="focus:bg-neutral-100">Streets</SelectItem>
                            <SelectItem value="satellite" className="focus:bg-neutral-100">Satellite</SelectItem>
                            <SelectItem value="dark" className="focus:bg-neutral-100">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSavePassengerSettings} size="sm" className="w-full" style={{ backgroundColor: REDHAT_RED_COLOR_BUTTON_BG, color: PASSENGER_HEADER_TEXT }}>Save My Settings</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-6 border-t border-neutral-200">
              {rideState.status === 'confirmingRide' && (
                <Button onClick={handleRequestRide} className="w-full text-white" style={{ backgroundColor: REDHAT_RED_COLOR_BUTTON_BG }} disabled={!rideState.pickupLocation || !rideState.dropoffLocation || !rideState.pickupTodaZoneId}>Request TriGo Now</Button>
              )}
              {(rideState.status === 'searching' || rideState.status === 'triderAssigned') && (
                <Button onClick={handleCancelRide} variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">Cancel Ride</Button>
              )}
               {rideState.status === 'completed' && (
                <Button onClick={handleNewRide} className="w-full text-white" style={{ backgroundColor: REDHAT_RED_COLOR_BUTTON_BG }}>Book Another Ride</Button>
              )}
               {(rideState.status === 'idle' || rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') ? (
                <Button onClick={handleCancelRide} variant="ghost" className="w-full text-neutral-600 hover:text-red-600">Reset / New Ride</Button>
              ) : null}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border border-neutral-300">
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
              <Marker longitude={rideState.pickupLocation.longitude} latitude={rideState.pickupLocation.latitude}>
                 <div title="Pickup" className="p-1 rounded-full bg-green-500 text-white shadow-md flex items-center justify-center">
                    <User size={18} />
                 </div>
              </Marker>
            )}
            {rideState.dropoffLocation && (
              <Marker longitude={rideState.dropoffLocation.longitude} latitude={rideState.dropoffLocation.latitude}>
                 <div title="Dropoff" className="p-1 rounded-full text-white shadow-md flex items-center justify-center" style={{backgroundColor: REDHAT_RED_COLOR_ACCENT}}>
                    <MapPin size={18} />
                 </div>
              </Marker>
            )}
            {triderSimLocation && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
              <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude}>
                 <div className="p-1.5 rounded-full shadow-md bg-blue-500 text-white animate-pulse" title="Your Trider" data-ai-hint="tricycle icon">
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
      <RideReceiptDialog 
        isOpen={isReceiptDialogOpen} 
        onOpenChange={setIsReceiptDialogOpen} 
        rideDetails={completedRideDetails} 
      />
      <footer className="p-2 shadow-inner flex justify-around items-center border-t border-neutral-200" style={{ backgroundColor: PASSENGER_HEADER_BG }}>
        <Link href="/passenger/dashboard" className={`flex flex-col items-center text-xs font-medium py-1 px-2 rounded-md ${pathname === '/passenger/dashboard' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
          <LayoutDashboard size={20} className="mb-1" />
          Dashboard
        </Link>
        <Link href="/passenger" className={`flex flex-col items-center text-xs font-medium py-1 px-2 rounded-md ${pathname === '/passenger' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
          <Bike size={20} className="mb-1" />
          Ride
        </Link>
        <Link href="/passenger/wallet" className={`flex flex-col items-center text-xs font-medium py-1 px-2 rounded-md ${pathname === '/passenger/wallet' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
          <Wallet size={20} className="mb-1" />
          Wallet
        </Link>
        <Link href="/passenger/premium" className={`flex flex-col items-center text-xs font-medium py-1 px-2 rounded-md ${pathname === '/passenger/premium' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
          <Gem size={20} className="mb-1" />
          Premium
        </Link>
      </footer>
    </div>
  );
}
