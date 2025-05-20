
"use client";

import * as React from 'react';
import {
  MapPin, Search, Bike, User, ArrowRight, CircleDollarSign, Clock, Loader2, Ticket, SettingsIcon, Crosshair, Globe, Grid, LogIn as LogInIcon, XCircle
} from 'lucide-react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type {
  Coordinates,
  PassengerRideState,
  TriderProfile,
  RoutePath,
  TodaZone,
  MockPassengerProfile,
  PassengerSettings,
  PassengerMapStyle
} from "@/types";
import { todaZones as appTodaZones } from "@/data/todaZones";
import { getRandomPointInCircle, calculateDistance, isPointInCircle } from "@/lib/geoUtils";
import { useSettings as useGeneralSettings } from "@/contexts/SettingsContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { RideReceiptDialog } from '@/components/passenger/RideReceiptDialog';

import PickMeUpNowButton from "@/components/ui/PickMeUpIcon";


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2';

const PASSENGER_PAGE_ACCENT_COLOR_HSL = 'hsl(262, 78%, 59%)'; // Purple
const PASSENGER_HEADER_BG = '#1F2937'; // Darker Gray/Blue for header
const PASSENGER_HEADER_TEXT = '#FFFFFF';
const PASSENGER_INPUT_TEXT_COLOR = 'text-neutral-700';
const PASSENGER_PLACEHOLDER_TEXT_COLOR = 'placeholder:text-neutral-400';

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
    isOnline: true,
  } as TriderProfile;
});

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

const TriGoPassengerLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="13" stroke={PASSENGER_PAGE_ACCENT_COLOR_HSL} strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <path d="M M9.5 12 Q16 8 22.5 12 L19.5 12" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
    <circle cx="17" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
  </svg>
);


function formatCountdown(seconds: number | null): string {
    if (seconds === null || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

export default function PassengerPage() {
  const {
    defaultMapCenter,
    defaultMapZoom,
    isLoading: settingsLoading,
    getTodaBaseFare,
    convenienceFee,
    perKmCharge,
  } = useGeneralSettings();
  const { toast } = useToast();

  const [loadedPassengerProfile, setLoadedPassengerProfile] = React.useState<MockPassengerProfile | null>(null);
  const [currentPassengerSettings, setCurrentPassengerSettings] = React.useState<PassengerSettings>({ mapStyle: DEFAULT_PASSENGER_MAP_STYLE });
  const [mapStyleUrl, setMapStyleUrl] = React.useState('mapbox://styles/mapbox/streets-v12');
  const [isRefreshingEta, setIsRefreshingEta] = React.useState(false);
  const toastShownForStatus = React.useRef<Record<string, boolean>>({});

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

  const [triderToPickupRouteColor, setTriderToPickupRouteColor] = React.useState('hsl(90, 90%, 50%)'); // Lime Green
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(PASSENGER_PAGE_ACCENT_COLOR_HSL); 

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
  const [completedRideDetails, setCompletedRideDetails] = React.useState<PassengerRideState | null>(null);

  const mapRef = React.useRef<MapRef | null>(null);

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
        const accentColorVar = computedStyles.getPropertyValue('--accent').trim(); // Default accent from globals.css
        setTriderToPickupRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'hsl(90, 90%, 50%)');
        setPickupToDropoffRouteColor(PASSENGER_PAGE_ACCENT_COLOR_HSL); // Passenger-specific accent
    }
  }, []);


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

  const resetRideState = React.useCallback(() => {
    setRideState({
      status: 'selectingPickup',
      passengerName: loadedPassengerProfile?.name || 'Valued Passenger',
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
      pickupTodaZoneId: null, countdownSeconds: null, estimatedDurationSeconds: null, completionTime: undefined, });
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setTriderSimLocation(null); // Clear trider marker
    setActiveSuggestionBox(null);
    setIsGeolocating(false);
    setIsSearchingAddress(false);
    toastShownForStatus.current = {}; // Reset toast flags
    handleStatusToast("Ride Reset", "Your ride request has been cleared.");
  }, [loadedPassengerProfile, handleStatusToast]);

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
    let storedProfile = null; 
    try {
      storedProfile = localStorage.getItem('selectedPassengerProfile');
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
    } finally {
      if (!storedProfile) {
        performGeolocation();
      }
    }
  }, [performGeolocation]);

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
            setRideState(prev => ({ ...prev, countdownSeconds: 0 }));
            if (prevLoc.longitude !== targetLocation.longitude || prevLoc.latitude !== targetLocation.latitude) {
                return targetLocation;
            }
            return prevLoc;
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
    const atPickup = rideState.triderToPickupPath && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= rideState.triderToPickupPath.coordinates.length - 1;
    const atDropoff = rideState.pickupToDropoffPath && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= rideState.pickupToDropoffPath.coordinates.length - 1;

    if (currentStatus === 'triderAssigned' && atPickup) {
      if (!toastShownForStatus.current[`arrived-pickup-${rideId}`]) {
        handleStatusToast("Trider Arrived for Pickup!", `${rideState.assignedTrider?.name} is here. Heading to destination.`);
        toastShownForStatus.current[`arrived-pickup-${rideId}`] = true;
      }
      if (rideState.dropoffLocation && rideState.pickupLocation) {
        setRideState(prev => ({ ...prev, status: 'inProgress', currentTriderPathIndex: 0, triderToPickupPath: null, countdownSeconds: 0 }));
        fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true);
      }
    } else if (currentStatus === 'inProgress' && atDropoff) {
      if (!toastShownForStatus.current[`completed-${rideId}`]) {
        handleStatusToast("Ride Completed!", `You've arrived. Thank you for using TriGo, ${rideState.passengerName}!`);
        toastShownForStatus.current[`completed-${rideId}`] = true;
      }
      const now = new Date();
      const finalRideState = {...rideState, status: 'completed' as const, pickupToDropoffPath: null, completionTime: now, countdownSeconds: 0};
      setRideState(finalRideState);
      setCompletedRideDetails(finalRideState);
      console.log("Simulating: Ride completed. Receipt data to save:", finalRideState);
      setIsReceiptDialogOpen(true);
    }
  }, [rideState.status, rideState.currentTriderPathIndex, rideState.triderToPickupPath, rideState.pickupToDropoffPath, rideState.assignedTrider, rideState.currentRideId, rideState.dropoffLocation, rideState.pickupLocation, rideState.passengerName, fetchRoute, handleStatusToast]);


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

  const handleSuggestionSelect = async (suggestion: MapboxGeocodingFeature, type: 'pickup' | 'dropoff') => {
    const location: Coordinates = { longitude: suggestion.center[0], latitude: suggestion.center[1] };
    const selectedZone = getTodaZoneForLocation(location);

    if (type === 'pickup') {
      setRideState(prev => ({ ...prev, pickupLocation: location, pickupAddress: suggestion.place_name, status: prev.dropoffLocation ? 'confirmingRide' : 'selectingDropoff', pickupTodaZoneId: selectedZone?.id || null }));
      setPickupInput(suggestion.place_name);
      setPickupSuggestions([]);
      handleStatusToast("Pickup Set", `Zone: ${selectedZone?.name || 'N/A'}. Now select dropoff.`);
      if (rideState.dropoffLocation) {
        const fare = calculateEstimatedFare(location, rideState.dropoffLocation, selectedZone?.id || null);
        await fetchRoute(location, rideState.dropoffLocation, 'confirmation', false);
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    } else {
      setRideState(prev => ({ ...prev, dropoffLocation: location, dropoffAddress: suggestion.place_name, status: prev.pickupLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setDropoffInput(suggestion.place_name);
      setDropoffSuggestions([]);
      handleStatusToast("Dropoff Set", "Review details and confirm.");
      if (rideState.pickupLocation) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, location, rideState.pickupTodaZoneId);
        await fetchRoute(rideState.pickupLocation, location, 'confirmation', false);
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
    } else if (rideState.status === 'confirmingRide') {
    }
  };

  const handlePickMeUpNow = async () => {
     if (rideState.status === 'confirmingRide' && rideState.pickupLocation && rideState.dropoffLocation && rideState.estimatedFare !== null && rideState.pickupTodaZoneId) {
         setRideState(prev => ({ ...prev, status: 'searching', assignedTrider: null }));
         handleStatusToast("Searching for TriDer...", "Looking for available triders near your pickup location.");
         console.log("Simulating: Searching for trider with request:", {
             passengerName: rideState.passengerName,
             pickupLocation: rideState.pickupLocation,
             dropoffLocation: rideState.dropoffLocation,
             estimatedFare: rideState.estimatedFare,
             pickupTodaZoneId: rideState.pickupTodaZoneId
         });

         // Simulate finding a trider after a short delay
         setTimeout(async () => {
             const assignedTrider = mockTridersForDemo[Math.floor(Math.random() * mockTridersForDemo.length)];
             const rideId = `ride-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
             setTriderSimLocation(assignedTrider.location);
             await fetchRoute(assignedTrider.location, rideState.pickupLocation!, 'triderToPickup'); 

             setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider, currentRideId: rideId, currentTriderPathIndex: 0, completionTime: undefined }));
             handleStatusToast("TriDer Found!", `${assignedTrider.name} is on the way to your pickup location.`);
             toastShownForStatus.current[`arrived-pickup-${rideId}`] = false; 
             toastShownForStatus.current[`completed-${rideId}`] = false; 
         }, 3000); 
     }
  };

  const mainButtonColorClass = `bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL}] hover:bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL}]/90`;
  const countdownColorStyle = { color: PASSENGER_PAGE_ACCENT_COLOR_HSL };
  const countdownPulseClass = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 ? 'font-bold animate-pulse' : 'font-bold';

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-red-600">
        <Alert variant="destructive" className="w-full max-w-sm">
          <AlertTitle>Mapbox Token Missing</AlertTitle>
          <AlertDescription>
            Mapbox access token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

return (
  <div className="bg-white text-neutral-800 flex flex-col h-screen">
    {/* Header */}
    <div style={{ backgroundColor: PASSENGER_HEADER_BG, color: PASSENGER_HEADER_TEXT }} className="p-4 flex items-center justify-between shadow-md z-20 relative">
      <div className="flex items-center space-x-2">
        <TriGoPassengerLogo />
        <h1 className="text-xl font-bold" style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL }}>TriGo Passenger</h1>
      </div>
      <div className="flex items-center space-x-2">
        {rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && (
           <Button variant="ghost" size="icon" onClick={resetRideState} title="Reset Ride" className="text-white hover:bg-white/20 hover:text-white">
              <XCircle size={20} />
           </Button>
        )}
        {loadedPassengerProfile && (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={loadedPassengerProfile.profilePictureUrl} alt={loadedPassengerProfile.name} />
              <AvatarFallback>{loadedPassengerProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm hidden sm:inline">{loadedPassengerProfile.name}</span>
          </div>
        )}
        {/* Placeholder Icons from RedHat image */}
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white"><Search size={18}/></Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white"><Globe size={18}/></Button>
        <Accordion type="single" collapsible className="w-auto text-white">
          <AccordionItem value="settings" className="border-b-0">
            <AccordionTrigger className="p-1.5 hover:no-underline hover:bg-white/20 rounded">
              <SettingsIcon size={20} />
            </AccordionTrigger>
            <AccordionContent className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg p-4 z-20">
              <h3 className="text-lg font-semibold mb-2 text-neutral-700">Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mapStyle" className="text-neutral-600">Map Style</Label>
                  <Select value={currentPassengerSettings.mapStyle} onValueChange={(value: PassengerMapStyle) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value }))}>
                    <SelectTrigger id="mapStyle" className="mt-1 text-neutral-700 border-neutral-300">
                      <SelectValue placeholder="Select map style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streets">Streets</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSavePassengerSettings} className={`w-full ${mainButtonColorClass}`}>Save Settings</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white"><LogInIcon size={18} /></Button> {/* Mock Login */}
      </div>
    </div>

    {/* Main Content Area */}
    <div className="relative flex-1">
      {/* Map */}
      <div className="relative flex-1">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: 'calc(100vh - 72px)' }} 
          mapStyle={mapStyleUrl}
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          interactiveLayerIds={['toda-zones-fill']}
        >
          <NavigationControl position="top-left" />

          <Source id="toda-zones" type="geojson" data={{
            type: 'FeatureCollection',
            features: appTodaZones.map(zone => ({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [zone.boundary.map(coord => [coord.longitude, coord.latitude])]
              },
              properties: { id: zone.id, name: zone.name }
            }))
          }}>
            <Layer
              id="toda-zones-fill"
              type="fill"
              paint={{
                'fill-color': ['match', ['get', 'id'],
                  rideState.pickupTodaZoneId, 'hsla(120, 100%, 50%, 0.2)', 
                  'hsla(240, 100%, 50%, 0.1)' 
                ],
                'fill-outline-color': ['match', ['get', 'id'],
                   rideState.pickupTodaZoneId, 'hsla(120, 100%, 50%, 0.5)',
                  'hsla(240, 100%, 50%, 0.3)'
                ],
              }}
            />
             <Layer
              id="toda-zones-border"
              type="line"
              paint={{
                'line-color': ['match', ['get', 'id'],
                   rideState.pickupTodaZoneId, 'hsla(120, 100%, 50%, 0.8)',
                  'hsla(240, 100%, 50%, 0.5)'
                ],
                'line-width': 1,
              }}
            />
          </Source>

          {rideState.pickupLocation && (
            <Marker longitude={rideState.pickupLocation.longitude} latitude={rideState.pickupLocation.latitude} anchor="bottom">
              <MapPin size={30} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL }} fill={PASSENGER_PAGE_ACCENT_COLOR_HSL} />
            </Marker>
          )}

          {rideState.dropoffLocation && (
            <Marker longitude={rideState.dropoffLocation.longitude} latitude={rideState.dropoffLocation.latitude} anchor="bottom">
              <MapPin size={30} color="hsl(220, 70%, 50%)" fill="hsl(220, 70%, 50%)" /> {/* Standard Blue for dropoff */}
            </Marker>
          )}

           {triderSimLocation && rideState.assignedTrider && (
             <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude} anchor="bottom">
                <Bike size={30} style={{color: triderToPickupRouteColor }} fill={triderToPickupRouteColor} />
             </Marker>
           )}

          {rideState.triderToPickupPath && (
            <Source id="trider-to-pickup-route" type="geojson" data={{ type: 'Feature', geometry: rideState.triderToPickupPath }}>
              <Layer
                id="trider-to-pickup-route-line"
                type="line"
                paint={{ 'line-color': triderToPickupRouteColor, 'line-width': 4, 'line-opacity': 0.75 }} />
            </Source>
          )}

          {rideState.pickupToDropoffPath && (
            <Source id="pickup-to-dropoff-route" type="geojson" data={{ type: 'Feature', geometry: rideState.pickupToDropoffPath }}>
              <Layer
                id="pickup-to-dropoff-route-line"
                type="line"
                paint={{ 'line-color': pickupToDropoffRouteColor, 'line-width': 4, 'line-opacity': 0.75 }} />
            </Source>
          )}
        </Map>

        {/* Address Search Boxes & Controls */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4 space-y-2">
          {(rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
            <Card className="bg-white/90 backdrop-blur-sm border-neutral-200 shadow-lg">
              <CardContent className="p-3 space-y-2">
                <div className="relative">
                  <Input
                    type="text" placeholder="Enter Pickup Location" value={pickupInput}
                    onChange={(e) => { setPickupInput(e.target.value); handleGeocodeSearch(e.target.value, 'pickup'); }}
                    onFocus={() => setActiveSuggestionBox('pickup')}
                    className={`w-full bg-white shadow-md ${PASSENGER_INPUT_TEXT_COLOR} ${PASSENGER_PLACEHOLDER_TEXT_COLOR} pr-10`}
                    disabled={rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide'} />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8" onClick={performGeolocation} disabled={isGeolocating}>
                    {isGeolocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair size={18} className="text-neutral-500" />}
                  </Button>
                  {isSearchingAddress && activeSuggestionBox === 'pickup' && (
                     <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-neutral-500" />
                  )}
                  {pickupSuggestions.length > 0 && activeSuggestionBox === 'pickup' && (
                    <Card className="absolute top-full mt-1 w-full shadow-lg z-20 bg-white">
                      <CardContent className="p-0 max-h-48 overflow-y-auto">
                        {pickupSuggestions.map(suggestion => (
                          <div key={suggestion.id} className={`p-3 cursor-pointer hover:bg-neutral-100 border-b last:border-b-0 ${PASSENGER_INPUT_TEXT_COLOR}`} onClick={() => handleSuggestionSelect(suggestion, 'pickup')}>
                            {suggestion.place_name}
                          </div> ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {(rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
                  <div className="relative">
                    <Input
                      type="text" placeholder="Enter Dropoff Location" value={dropoffInput}
                      onChange={(e) => { setDropoffInput(e.target.value); handleGeocodeSearch(e.target.value, 'dropoff'); }}
                      onFocus={() => setActiveSuggestionBox('dropoff')}
                       className={`w-full bg-white shadow-md ${PASSENGER_INPUT_TEXT_COLOR} ${PASSENGER_PLACEHOLDER_TEXT_COLOR}`}
                       disabled={rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide'} />
                     {isSearchingAddress && activeSuggestionBox === 'dropoff' && ( <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-neutral-500" /> )}
                    {dropoffSuggestions.length > 0 && activeSuggestionBox === 'dropoff' && (
                      <Card className="absolute top-full mt-1 w-full shadow-lg z-20 bg-white">
                        <CardContent className="p-0 max-h-48 overflow-y-auto">
                          {dropoffSuggestions.map(suggestion => (
                            <div key={suggestion.id} className={`p-3 cursor-pointer hover:bg-neutral-100 border-b last:border-b-0 ${PASSENGER_INPUT_TEXT_COLOR}`} onClick={() => handleSuggestionSelect(suggestion, 'dropoff')}>
                              {suggestion.place_name}
                            </div> ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ride Status / Confirmation Card / Timer */}
        {(rideState.status === 'confirmingRide' || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
           <Alert className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm p-4 bg-black/70 backdrop-blur-sm shadow-xl rounded-xl" style={{ borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL }}>
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Ticket size={20} className="text-white" />
                    <AlertTitle className="text-white font-semibold">
                        {rideState.status === 'confirmingRide' && 'Confirm Ride'}
                        {rideState.status === 'searching' && 'Finding TriDer...'}
                        {rideState.status === 'triderAssigned' && `TriDer En Route`}
                        {rideState.status === 'inProgress' && `Ride In Progress`}
                    </AlertTitle>
                </div>
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.countdownSeconds !== null && (
                    <div className={`text-2xl ${countdownPulseClass}`} style={countdownColorStyle}>
                        {formatCountdown(rideState.countdownSeconds)}
                        {isRefreshingEta && <Loader2 className="inline-block h-4 w-4 ml-1 animate-spin" />}
                    </div>
                )}
             </div>
             <AlertDescription className="space-y-1.5 text-white/90 text-sm">
                {rideState.status === 'confirmingRide' && (
                    <>
                        <p>From: {rideState.pickupAddress}</p>
                        <p>To: {rideState.dropoffAddress}</p>
                        <p className="font-semibold">Est. Fare: ₱{rideState.estimatedFare?.toFixed(2) || 'N/A'}</p>
                    </>
                )}
                {rideState.status === 'searching' && <p>Searching for the nearest available trider for you...</p>}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                    <>
                        <p>Trider: {rideState.assignedTrider.name} ({rideState.assignedTrider.vehicleType})</p>
                        <p>Ride Ticket #: {rideState.currentRideId || "N/A"}</p>
                    </>
                )}
             </AlertDescription>
             {rideState.status === 'confirmingRide' && (
                <Button className={`w-full mt-4 ${mainButtonColorClass} text-white`} onClick={handlePickMeUpNow} disabled={!rideState.pickupLocation || !rideState.dropoffLocation || rideState.estimatedFare === null}>
                    Request TriGo Now
                </Button>
             )}
           </Alert>
        )}

        {/* Pick Me Up Now Button (Initial State) */}
        {rideState.status === 'selectingDropoff' && rideState.pickupLocation && !rideState.dropoffLocation && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <PickMeUpNowButton onClick={() => {
                 if (!rideState.dropoffLocation && rideState.pickupLocation && rideState.pickupTodaZoneId) {
                    const pickupZone = appTodaZones.find(z => z.id === rideState.pickupTodaZoneId);
                    if (pickupZone) {
                       const simulatedDropoff = getRandomPointInCircle(pickupZone.center, pickupZone.radiusKm * 0.5);
                       const simulatedDropoffAddress = `${pickupZone.name} area (simulated dropoff)`;
                       const fare = calculateEstimatedFare(rideState.pickupLocation, simulatedDropoff, rideState.pickupTodaZoneId);
                       fetchRoute(rideState.pickupLocation, simulatedDropoff, 'confirmation', false);
                       setRideState(prev => ({
                          ...prev,
                          dropoffLocation: simulatedDropoff,
                          dropoffAddress: simulatedDropoffAddress,
                          estimatedFare: fare,
                          status: 'confirmingRide'
                       }));
                       setDropoffInput(simulatedDropoffAddress);
                       handleStatusToast("Simulated Dropoff Set", "Review details and confirm.");
                    } else { handleStatusToast("Cannot Simulate Dropoff", "Could not find pickup zone for simulation.", "destructive"); }
                 }
              }} />
           </div>
        )}

         {/* Book Another Ride Button */}
         {rideState.status === 'completed' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs px-4">
                <Button className={`w-full ${mainButtonColorClass} text-white`} onClick={() => { resetRideState(); setIsReceiptDialogOpen(false); }}>
                    Book Another Ride
                </Button>
            </div>
         )}
      </div>
    </div>

    {completedRideDetails && (
      <RideReceiptDialog
        isOpen={isReceiptDialogOpen}
        onOpenChange={(isOpen) => {
          setIsReceiptDialogOpen(isOpen);
          if (!isOpen) resetRideState(); // Reset if dialog is manually closed
        }}
        rideDetails={completedRideDetails}
      />
    )}

  </div>
);
}

