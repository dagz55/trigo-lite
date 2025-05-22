
"use client";

import * as React from 'react';
import {
  MapPin, Search, User, ArrowRight, CircleDollarSign, Clock, Loader2, Ticket, Settings as SettingsIconLucide, Crosshair, Globe, Grid, LogIn as LogInIcon, XCircle, Menu as MenuIcon, History, CalendarCheck2, CreditCard, Bike, Star, Share2
} from 'lucide-react';
import { NeonTrikeCtaButton } from "@/components/ui/NeonTrikeCtaButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Map, { Marker, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
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
import { useSettings } from "@/contexts/SettingsContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { RideReceiptDialog } from '@/components/passenger/RideReceiptDialog';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2';

const PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING = 'hsl(280, 80%, 70%)'; // Light Purple/Pinkish
const PASSENGER_HEADER_BG = 'black';
const PASSENGER_HEADER_TEXT = 'white';
const PASSENGER_INPUT_TEXT_COLOR = 'text-neutral-100'; // For dark inputs on light cards
const PASSENGER_PLACEHOLDER_TEXT_COLOR = 'placeholder:text-neutral-400'; // For dark inputs
const PASSENGER_FLOATING_CARD_BG_DARK_GLASS = 'bg-black/70 backdrop-blur-md';
const PASSENGER_FLOATING_CARD_BORDER_DARK_GLASS = 'border-slate-700/50';
const PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS = 'shadow-2xl shadow-primary/20';

const NEON_GREEN_TEXT_TIMER = 'text-lime-400';
const NEON_GREEN_TEXT_TIMER_PULSE = 'text-lime-300';

const DEFAULT_PASSENGER_MAP_STYLE: PassengerMapStyle = 'streets';

let bodyNumberCounter = 100;
const generatePassengerMockBodyNumber = () => {
  bodyNumberCounter++;
  return bodyNumberCounter.toString().padStart(3, '0');
};

const mockTridersForDemo: TriderProfile[] = [
  'Simon TK', 'Judas Isc. TK', 'Mary M. TK', 'Lazarus TK', 'Martha TK'
].map((name, index) => {
  const zone = appTodaZones.find(z => z.id === TALON_KUATRO_ZONE_ID);
  if (!zone) throw new Error(`Talon Kuatro zone with ID ${TALON_KUATRO_ZONE_ID} not found for mock triders.`);
  return {
    id: `trider-sim-tk-${index + 1}`,
    name: `${name}`,
    bodyNumber: generatePassengerMockBodyNumber(),
    location: getRandomPointInCircle(zone.center, zone.radiusKm * 0.5),
    status: 'available',
    vehicleType: 'Tricycle',
    todaZoneId: zone.id,
    todaZoneName: zone.name,
    profilePictureUrl: `https://placehold.co/100x100.png?text=${name.split(' ')[0].charAt(0)}`,
    dataAiHint: "driver person",
    wallet: {
      currentBalance: 100 + Math.random() * 200,
      totalEarnedAllTime: 500 + Math.random() * 1000,
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

function formatCountdown(seconds: number | null): string {
    if (seconds === null || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TriGoPassengerLogoInHeader = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
    <circle cx="16" cy="16" r="13" stroke={PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING} strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <path d="M9.5 12 Q16 8 22.5 12 L19.5 12" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
    <circle cx="17" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none"/>
  </svg>
);


export default function PassengerPage() {
  const {
    defaultMapCenter,
    defaultMapZoom,
    isLoading: settingsLoading,
    getTodaBaseFare,
    perKmCharge,
    convenienceFee,
    getTodaTerminalExitPoint
  } = useSettings();
  const { toast } = useToast();

  const [currentView, setCurrentView] = React.useState<'landing' | 'requestingRide'>('landing');

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
    passengerName: 'Michelle',
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
    shareToken: null,
  });
  const [rideUpdates, setRideUpdates] = React.useState<string[]>([]);

  const [triderSimLocation, setTriderSimLocation] = React.useState<Coordinates | null>(null);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = React.useState(false);

  const [pickupInput, setPickupInput] = React.useState('');
  const [dropoffInput, setDropoffInput] = React.useState('');
  const [pickupSuggestions, setPickupSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = React.useState<'pickup' | 'dropoff' | null>(null);

  const [triderToPickupRouteColor, setTriderToPickupRouteColor] = React.useState('hsl(var(--accent))');
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING);

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
  const [completedRideDetails, setCompletedRideDetails] = React.useState<PassengerRideState | null>(null);

  const mapRef = React.useRef<MapRef | null>(null);

  const addRideUpdate = React.useCallback((update: string) => {
    setRideUpdates(prev => [update, ...prev.slice(0, 4)]);
  }, []);

  const handleStatusToast = React.useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({ title, description, variant });
  }, [toast]);

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
        setTriderToPickupRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'hsl(120, 70%, 50%)');
        setPickupToDropoffRouteColor(PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING);
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

  const calculateEstimatedFare = React.useCallback((pickupLoc: Coordinates, dropoffLoc: Coordinates, pickupZoneId: string | null): number => {
    if (settingsLoading || !pickupLoc || !dropoffLoc || !pickupZoneId) return 0;
    const distance = calculateDistance(pickupLoc, dropoffLoc);
    const base = getTodaBaseFare(pickupZoneId);
    const fare = base + (distance * perKmCharge) + convenienceFee;
    return parseFloat(fare.toFixed(2));
  }, [getTodaBaseFare, perKmCharge, convenienceFee, settingsLoading]);


  const fetchRoute = React.useCallback(async (start: Coordinates, end: Coordinates, routeType: 'triderToPickup' | 'pickupToDropoff' | 'confirmation', showToastFeedback: boolean = true): Promise<RoutePath | null> => {
    if (!MAPBOX_TOKEN) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?steps=true&geometries=geojson&overview=full&alternatives=true&access_token=${MAPBOX_TOKEN}`;
    try {
      const response: Response = await fetch(url);
      const data = await response.json();

      let chosenRoute = null;
      if (data.routes && data.routes.length > 0) {
        if (data.routes.length > 1) {
          chosenRoute = data.routes.reduce((shortest: any, current: any) =>
            current.distance < shortest.distance ? current : shortest
          );
           if (showToastFeedback && routeType !== 'confirmation') {
            handleStatusToast("Route Updated (Shortest Distance)", `Using shortest of ${data.routes.length} alternatives.`);
          }
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
           addRideUpdate(`Estimated route duration: ${formatCountdown(durationSeconds)}`);
           setRideState(prev => ({
             ...prev,
             pickupToDropoffPath: routeGeometry,
             triderToPickupPath: null,
             estimatedDurationSeconds: durationSeconds,
             countdownSeconds: null
           }));
        }
        if (showToastFeedback && routeType !== 'confirmation' && chosenRoute) {
           const etaMessage = `ETA: ${formatCountdown(durationSeconds)}`;
           handleStatusToast(`Route Updated (${routeType === 'triderToPickup' ? 'To Pickup' : 'To Dropoff'})`, etaMessage);
           addRideUpdate(`Route update: ${routeType === 'triderToPickup' ? 'Trider to pickup' : 'Pickup to dropoff'} - ${etaMessage}`);
        }
        return routeGeometry;

      } else {
        setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
        if (showToastFeedback) handleStatusToast("Route Not Found", data.message || "Could not calculate route for the selected points.", "destructive");
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
      if (showToastFeedback) handleStatusToast("Route Error", "Failed to fetch route information.", "destructive");
    }
    return null;
  }, [MAPBOX_TOKEN, handleStatusToast, addRideUpdate]);

  const performGeolocation = React.useCallback(async (setAsPickup = true) => {
    if (settingsLoading) {
        setIsGeolocating(false);
        return;
    }
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

          if (setAsPickup) {
            const terminal = pickupZone ? getTodaTerminalExitPoint(pickupZone.id) : undefined;
            const newDropoffLocation = terminal?.point || null;
            const newDropoffAddress = terminal?.address || '';

            setRideState(prev => ({
                ...prev,
                pickupLocation: coords,
                pickupAddress: address,
                status: newDropoffLocation ? 'confirmingRide' : 'selectingDropoff',
                pickupTodaZoneId: pickupZone?.id || null,
                dropoffLocation: newDropoffLocation,
                dropoffAddress: newDropoffAddress
            }));
            setPickupInput(address);
            if (newDropoffLocation) setDropoffInput(newDropoffAddress);
            addRideUpdate(`Pickup location set to your current location: ${address}`);
            if (pickupZone?.name) addRideUpdate(`Identified pickup zone: ${pickupZone.name}`);

            let toastDesc = `Zone: ${pickupZone?.name || 'N/A'}.`;
            if (newDropoffLocation && coords && !settingsLoading) {
                const fare = calculateEstimatedFare(coords, newDropoffLocation, pickupZone?.id || null);
                await fetchRoute(coords, newDropoffLocation, 'confirmation', false);
                setRideState(prev => ({...prev, estimatedFare: fare}));
                toastDesc += ` Default dropoff set to ${pickupZone?.name || ''} Terminal.`;
            } else {
                toastDesc += " Now select dropoff.";
            }
            handleStatusToast("Current Location Set as Pickup", toastDesc);

          }

        } catch (error) {
          console.error("Error reverse geocoding:", error);
           if (setAsPickup) {
            setRideState(prev => ({ ...prev, pickupLocation: coords, pickupAddress: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, status: 'selectingDropoff', pickupTodaZoneId: pickupZone?.id || null }));
            setPickupInput(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
            handleStatusToast("Current Location Set as Pickup", `Using coordinates (Zone: ${pickupZone?.name || 'N/A'}). Now select dropoff.`);
          }
        } finally {
           setViewState(prev => ({ ...prev, ...coords, zoom: 15 }));
           setIsGeolocating(false);
        }
      },
      (error) => {
        console.warn("Error getting geolocation:", error.message);
        handleStatusToast("Geolocation Failed", "Could not get current location. Please set pickup manually.", "destructive");
        if(setAsPickup) setRideState(prev => ({ ...prev, status: 'selectingPickup' }));
        setIsGeolocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [settingsLoading, MAPBOX_TOKEN, handleStatusToast, getTodaZoneForLocation, getTodaTerminalExitPoint, calculateEstimatedFare, fetchRoute, addRideUpdate]);

  const resetRideState = React.useCallback(() => {
    setCurrentView('landing');
    toastShownForStatus.current = {};
    setRideState({
      status: 'idle',
      passengerName: loadedPassengerProfile?.name || 'Michelle',
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
      shareToken: null,
    });
    setRideUpdates([]);
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setTriderSimLocation(null);
    setActiveSuggestionBox(null);
    setIsGeolocating(false);
    setIsSearchingAddress(false);
  }, [loadedPassengerProfile?.name]);

  React.useEffect(() => {
    let storedProfile = null;
    let selectedZoneIdFromStorage: string | null = null;
    let selectedRoleFromStorage: string | null = null;

    try {
      selectedZoneIdFromStorage = localStorage.getItem('selectedTodaZoneId_TriGo');
      selectedRoleFromStorage = localStorage.getItem('selectedRole_TriGo');

      if (selectedZoneIdFromStorage && selectedRoleFromStorage === 'passenger') {
        const zone = appTodaZones.find(z => z.id === selectedZoneIdFromStorage);
        if (zone) {
          const tempProfile = {
            id: `temp-pass-${Date.now()}`,
            name: 'Valued Passenger',
            todaZoneId: zone.id,
            todaZoneName: zone.name,
            settings: { mapStyle: DEFAULT_PASSENGER_MAP_STYLE }
          };
          setLoadedPassengerProfile(tempProfile);
          setRideState(prev => ({ ...prev, passengerName: tempProfile.name, pickupTodaZoneId: zone.id, status: 'selectingPickup' }));
          setCurrentPassengerSettings(tempProfile.settings);
          setViewState(prev => ({ ...prev, ...zone.center, zoom: 15 }));
          if (currentView === 'requestingRide' && !settingsLoading) {
              if (!rideState.pickupLocation && !tempProfile) {
                performGeolocation();
              }
          }
        }
      } else {
        storedProfile = localStorage.getItem('selectedPassengerProfile');
        if (storedProfile) {
          const passenger: MockPassengerProfile = JSON.parse(storedProfile);
          setLoadedPassengerProfile(passenger);
          setRideState(prev => ({ ...prev, passengerName: passenger.name, pickupTodaZoneId: passenger.todaZoneId, status: 'selectingPickup' }));

          const storedPassengerSettings = localStorage.getItem(`passengerSettings_${passenger.id}`);
          let pSettings: PassengerSettings = passenger.settings || { mapStyle: DEFAULT_PASSENGER_MAP_STYLE };
          if (storedPassengerSettings) {
            pSettings = { ...pSettings, ...JSON.parse(storedPassengerSettings) };
          }
          setCurrentPassengerSettings(pSettings);

          const passengerZone = appTodaZones.find(z => z.id === passenger.todaZoneId);
          if (passengerZone) {
            setViewState(prev => ({ ...prev, ...passengerZone.center, zoom: 15 }));
          }
          if (currentView === 'requestingRide' && !settingsLoading) {
             if (!rideState.pickupLocation && !passenger) {
                performGeolocation();
             }
          }
        } else if (currentView === 'requestingRide' && !settingsLoading) {
           if (!rideState.pickupLocation) performGeolocation();
        }
      }
      localStorage.removeItem('selectedTodaZoneId_TriGo');
      localStorage.removeItem('selectedTodaZoneName_TriGo');
      localStorage.removeItem('selectedRole_TriGo');
      localStorage.removeItem('selectedPassengerProfile');
    } catch (error) {
      console.error("Error loading passenger/zone info from localStorage:", error);
      if (currentView === 'requestingRide' && !settingsLoading) {
        if (!rideState.pickupLocation) performGeolocation();
      }
    }
  }, [currentView, performGeolocation, settingsLoading, rideState.pickupLocation]);


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

  React.useEffect(() => {
    if (settingsLoading || !loadedPassengerProfile && rideState.status === 'idle' && !rideState.pickupLocation && currentView === 'requestingRide') {
      setViewState(prev => ({
        ...prev,
        longitude: defaultMapCenter.longitude,
        latitude: defaultMapCenter.latitude,
        zoom: defaultMapZoom + 1,
      }));
    }
  }, [defaultMapCenter, defaultMapZoom, settingsLoading, loadedPassengerProfile, rideState.status, rideState.pickupLocation, currentView]);

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

    const triderMovementLogic = () => {
      setTriderSimLocation(prevLoc => {
        if (!prevLoc) return prevLoc;

        const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
        const targetLocation = rideState.status === 'triderAssigned' ? rideState.pickupLocation! : rideState.dropoffLocation!;

        if (!currentPath || !targetLocation || rideState.currentTriderPathIndex === undefined) return prevLoc;

        const atDestinationOfSegment = rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

        if (atDestinationOfSegment) {
            // Already at destination, but set countdown to 0 if it isn't already
            if (rideState.countdownSeconds !== 0) {
                 setRideState(prevRide => ({ ...prevRide, countdownSeconds: 0 }));
            }
            // Ensure trider is exactly at target if path ended
            if (prevLoc.longitude !== targetLocation.longitude || prevLoc.latitude !== targetLocation.latitude) {
                return targetLocation;
            }
            return prevLoc; // Stay at target
        }

        let nextIndex = rideState.currentTriderPathIndex + 1;
        const newCoords: Coordinates = {
          longitude: currentPath.coordinates[nextIndex][0],
          latitude: currentPath.coordinates[nextIndex][1],
        };
        setRideState(prev => ({ ...prev, currentTriderPathIndex: nextIndex }));
        return newCoords;
      });
    };

    if ( triderSimLocation && rideState.pickupLocation && rideState.dropoffLocation &&
      ((rideState.status === 'triderAssigned' && rideState.triderToPickupPath) || (rideState.status === 'inProgress' && rideState.pickupToDropoffPath))
    ) {
      moveIntervalId = setInterval(triderMovementLogic, 2000);
    }
    return () => clearInterval(moveIntervalId);
  }, [
    rideState.status,
    rideState.triderToPickupPath,
    rideState.pickupToDropoffPath,
    triderSimLocation,
    rideState.currentTriderPathIndex,
    rideState.pickupLocation,
    rideState.dropoffLocation,
    rideState.countdownSeconds // Added to re-evaluate if countdown hits zero externally
  ]);


  const prevRideStatusRef = React.useRef<PassengerRideState['status']>();
  React.useEffect(() => {
    const currentStatus = rideState.status;
    const prevStatus = prevRideStatusRef.current;

    // Only show toast if status changed and for current ride
    if (prevStatus === currentStatus && rideState.currentRideId) {
      return;
    }

    const showToastForThisStatus = (title: string, description: string) => {
      const toastKey = `${currentStatus}-${rideState.currentRideId || 'ride'}`;
      if (!toastShownForStatus.current[toastKey]) {
        handleStatusToast(title, description);
        toastShownForStatus.current[toastKey] = true;
      }
    };

    switch (currentStatus) {
      case 'triderAssigned':
        if (prevStatus === 'searching') {
          showToastForThisStatus("TriDer Assigned!", `TriDer ${rideState.assignedTrider?.name} (#${rideState.assignedTrider?.bodyNumber}) is on their way.`);
        }
        break;
      case 'inProgress':
        if (prevStatus === 'triderAssigned') {
          showToastForThisStatus("Trider Arrived for Pickup!", `${rideState.assignedTrider?.name || 'Your trider'} is here. Heading to destination.`);
          addRideUpdate(`TriDer ${rideState.assignedTrider?.name || ''} arrived at your pickup location.`);
        }
        break;
      case 'completed':
        if (prevStatus === 'inProgress') {
          showToastForThisStatus("Ride Completed!", `You've arrived. Thank you for using TriGo, ${rideState.passengerName || 'Passenger'}!`);
          addRideUpdate("Ride completed. Thank you for using TriGo!");
        }
        break;
    }
    prevRideStatusRef.current = currentStatus;
  }, [rideState.status, rideState.currentRideId, rideState.assignedTrider, rideState.passengerName, handleStatusToast, addRideUpdate]);


  React.useEffect(() => {
    const currentStatus = rideState.status;
    const pathToCheck = currentStatus === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
    const atDestinationOfSegment = pathToCheck && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= pathToCheck.coordinates.length - 1;

    if (currentStatus === 'triderAssigned' && atDestinationOfSegment) {
        if (rideState.dropoffLocation && rideState.pickupLocation) {
            setRideState(prev => ({ ...prev, status: 'inProgress', currentTriderPathIndex: 0, triderToPickupPath: null, countdownSeconds: 0 }));
            fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true);
        }
    } else if (currentStatus === 'inProgress' && atDestinationOfSegment) {
        const now = new Date();
        const finalRideState: PassengerRideState = {...rideState, status: 'completed' as const, pickupToDropoffPath: null, completionTime: now, countdownSeconds: 0};
        setRideState(finalRideState);
        setCompletedRideDetails(finalRideState);
        console.log("Simulating: Ride completed. Receipt data to save:", finalRideState);
        setIsReceiptDialogOpen(true);
    }
  }, [
      rideState.status,
      rideState.currentTriderPathIndex,
      rideState.triderToPickupPath,
      rideState.pickupToDropoffPath,
      rideState.pickupLocation,
      rideState.dropoffLocation,
      fetchRoute,
      addRideUpdate
  ]);


  const getRouteDuration = React.useCallback(async (start: Coordinates, end: Coordinates): Promise<number | null> => {
    if (!MAPBOX_TOKEN) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?overview=simplified&alternatives=true&access_token=${MAPBOX_TOKEN}`;
    try {
      const response: Response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
         const chosenRoute = data.routes.length > 1
            ? data.routes.reduce((shortest: any, current: any) => current.distance < shortest.distance ? current : shortest)
            : data.routes[0];
        return Math.round(chosenRoute.duration);
      }
    } catch (error) {
      console.error("Error fetching route duration:", error);
    }
    return null;
  }, [MAPBOX_TOKEN]);

  React.useEffect(() => {
    let etaRefreshIntervalId: NodeJS.Timeout;

    const refreshEta = async () => {
        if (!triderSimLocation || isRefreshingEta) return;

        const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
        const atDestinationOfSegment = currentPath && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

        if (atDestinationOfSegment) {
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
              const stillEnRouteThisSegment = prev.currentTriderPathIndex !== undefined &&
                                   ((prev.status === 'triderAssigned' && prev.triderToPickupPath && prev.currentTriderPathIndex < prev.triderToPickupPath.coordinates.length -1) ||
                                   (prev.status === 'inProgress' && prev.pickupToDropoffPath && prev.currentTriderPathIndex < prev.pickupToDropoffPath.coordinates.length -1));

              if(stillEnRouteThisSegment) {
                return { ...prev, countdownSeconds: newDuration };
              }
              return prev;
            });
          }
        }
        setIsRefreshingEta(false);
    };

    if ( (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && triderSimLocation) {
      etaRefreshIntervalId = setInterval(refreshEta, 7000);
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

  const handleGeocodeSearch = React.useCallback(async (searchText: string, type: 'pickup' | 'dropoff') => {
    if (!searchText.trim() || !MAPBOX_TOKEN) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const response: Response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=PH&limit=5&bbox=120.7,14.2,121.3,14.8`);
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
  }, [MAPBOX_TOKEN, handleStatusToast]);


  const handleSuggestionSelect = React.useCallback(async (suggestion: MapboxGeocodingFeature, type: 'pickup' | 'dropoff') => {
    const location: Coordinates = { longitude: suggestion.center[0], latitude: suggestion.center[1] };
    const selectedZone = getTodaZoneForLocation(location);

    if (type === 'pickup') {
      const terminal = selectedZone ? getTodaTerminalExitPoint(selectedZone.id) : undefined;
      const newDropoffLocation = terminal?.point || null;
      const newDropoffAddress = terminal?.address || '';
      setRideState(prev => ({ ...prev, pickupLocation: location, pickupAddress: suggestion.place_name, status: newDropoffLocation ? 'confirmingRide' : 'selectingDropoff', pickupTodaZoneId: selectedZone?.id || null, dropoffLocation: newDropoffLocation, dropoffAddress: newDropoffAddress }));
      setPickupInput(suggestion.place_name);
      setPickupSuggestions([]);
      if (newDropoffLocation) setDropoffInput(newDropoffAddress);
       addRideUpdate(`Pickup location set to: ${suggestion.place_name}`);
      if (selectedZone?.name) addRideUpdate(`Identified pickup zone: ${selectedZone.name}`);
       handleStatusToast("Pickup Set", `Zone: ${selectedZone?.name || 'N/A'}. ${newDropoffLocation ? `Default dropoff to ${selectedZone?.name || ''} Terminal.` : 'Select dropoff.'}`);
      if (newDropoffLocation && location && !settingsLoading) {
        const fare = calculateEstimatedFare(location, newDropoffLocation, selectedZone?.id || null);
        await fetchRoute(location, newDropoffLocation, 'confirmation', false);
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    } else {
      setRideState(prev => ({ ...prev, dropoffLocation: location, dropoffAddress: suggestion.place_name, status: prev.pickupLocation ? 'confirmingRide' : 'selectingDropoff' }));
      setDropoffInput(suggestion.place_name);
      setDropoffSuggestions([]);
       addRideUpdate(`Dropoff location set to: ${suggestion.place_name}`);
       handleStatusToast("Dropoff Set", "Review details and confirm.");
      if (rideState.pickupLocation && location && !settingsLoading) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, location, rideState.pickupTodaZoneId);
        await fetchRoute(rideState.pickupLocation, location, 'confirmation', false);
        setRideState(prev => ({...prev, estimatedFare: fare}));
      }
    }
    setViewState(prev => ({ ...prev, ...location, zoom: 15 }));
    setActiveSuggestionBox(null);
  }, [getTodaZoneForLocation, handleStatusToast, calculateEstimatedFare, fetchRoute, rideState.pickupLocation, rideState.pickupTodaZoneId, getTodaTerminalExitPoint, settingsLoading, addRideUpdate]);


  const handleMapClick = React.useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    if (isSearchingAddress || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress' || rideState.status === 'completed' ) return;
    const { lngLat } = event;
    const newLocation = { longitude: lngLat.lng, latitude: lngLat.lat };
    const newAddress = `Pin (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`;
    const clickedZone = getTodaZoneForLocation(newLocation);

    if (!rideState.pickupLocation || rideState.status === 'selectingPickup' ) {
      const terminal = clickedZone ? getTodaTerminalExitPoint(clickedZone.id) : undefined;
      const newDropoffLocation = terminal?.point || null;
      const newDropoffAddress = terminal?.address || '';

      setRideState(prev => ({
          ...prev,
          status: newDropoffLocation ? 'confirmingRide' : 'selectingDropoff',
          pickupLocation: newLocation,
          pickupAddress: newAddress,
          pickupTodaZoneId: clickedZone?.id || null,
          dropoffLocation: newDropoffLocation,
          dropoffAddress: newDropoffAddress
      }));
      setPickupInput(newAddress);
      setPickupSuggestions([]);
      if (newDropoffLocation) setDropoffInput(newDropoffAddress);
       addRideUpdate(`Pickup location set by map click: ${newAddress}`);
       if (clickedZone?.name) addRideUpdate(`Identified pickup zone: ${clickedZone.name}`);

      let toastDesc = `Zone: ${clickedZone?.name || 'N/A'}.`;
      if (newDropoffLocation && newLocation && !settingsLoading){
            const fare = calculateEstimatedFare(newLocation, newDropoffLocation, clickedZone?.id || null);
            fetchRoute(newLocation, newDropoffLocation, 'confirmation', false);
            setRideState(prev => ({...prev, estimatedFare: fare}));
            toastDesc += ` Default dropoff set to ${clickedZone?.name || ''} Terminal.`;
      } else {
          toastDesc += " Now select your dropoff location.";
      }
      handleStatusToast("Pickup Set by Map Click", toastDesc);

    } else if (!rideState.dropoffLocation || rideState.status === 'selectingDropoff') {
      if (!rideState.pickupLocation || settingsLoading || !newLocation) return;
      const fare = calculateEstimatedFare(rideState.pickupLocation, newLocation, rideState.pickupTodaZoneId);
      setRideState(prev => ({ ...prev, status: 'confirmingRide', dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare: fare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
       addRideUpdate(`Dropoff location set by map click: ${newAddress}`);
       if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation', false);
      handleStatusToast("Dropoff Set by Map Click", "Confirm your ride details.");
    } else if (rideState.status === 'confirmingRide') {
      if (!rideState.pickupLocation || settingsLoading || !newLocation) return;
      const fare = calculateEstimatedFare(rideState.pickupLocation, newLocation, rideState.pickupTodaZoneId);
      setRideState(prev => ({ ...prev, dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare: fare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
       addRideUpdate(`Dropoff location updated by map click: ${newAddress}`);
       if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation', false);
      handleStatusToast("Dropoff Updated by Map Click", "Confirm your ride details.");
    }
  }, [isSearchingAddress, rideState.status, rideState.pickupLocation, getTodaZoneForLocation, handleStatusToast, calculateEstimatedFare, fetchRoute, getTodaTerminalExitPoint, rideState.pickupTodaZoneId, settingsLoading, addRideUpdate]);

  const handlePickMeUpNow = React.useCallback(async () => {
     if (rideState.status === 'confirmingRide' && rideState.pickupLocation && rideState.dropoffLocation && rideState.estimatedFare !== null && rideState.pickupTodaZoneId) {
         toastShownForStatus.current = {};
         const newRideId = `TKT-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
         setRideState(prev => ({ ...prev, status: 'searching', assignedTrider: null, currentRideId: newRideId, shareToken: null })); // Reset shareToken

         addRideUpdate(`Ride request sent. Searching for TriDer (Ticket ID: ${newRideId})...`);
         console.log("Simulating: Searching for trider with request:", {
             passengerName: rideState.passengerName,
             pickupLocation: rideState.pickupLocation,
             dropoffLocation: rideState.dropoffLocation,
             estimatedFare: rideState.estimatedFare,
             pickupTodaZoneId: rideState.pickupTodaZoneId
         });

         setTimeout(async () => {
             const assignedTrider = mockTridersForDemo[Math.floor(Math.random() * mockTridersForDemo.length)];
             setTriderSimLocation(assignedTrider.location);
             await fetchRoute(assignedTrider.location, rideState.pickupLocation!, 'triderToPickup');

             addRideUpdate(`TriDer ${assignedTrider.name} (#${assignedTrider.bodyNumber}) assigned. En route to pickup.`);
             setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider, currentTriderPathIndex: 0, completionTime: undefined }));
         }, 3000);
     }
  }, [rideState, fetchRoute, addRideUpdate]);

  const handleSimulateDropoffForPickMeUp = React.useCallback(async () => {
    if (settingsLoading || !rideState.pickupLocation || !rideState.pickupTodaZoneId) {
        handleStatusToast("Cannot Simulate Dropoff", "Pickup location or zone information is missing, or settings are still loading.", "destructive");
        return;
    }
    if (rideState.dropoffLocation) {
        setRideState(prev => ({ ...prev, status: 'confirmingRide', currentRideId: `TKT-${Date.now()}-${Math.random().toString(16).slice(2,6)}` }));
        handleStatusToast("Dropoff Already Set", "Proceed to confirm your ride details.");
        return;
    }

    const terminal = getTodaTerminalExitPoint(rideState.pickupTodaZoneId);
    const simulatedDropoff = terminal?.point;
    const simulatedDropoffAddress = terminal?.address || "Nearest Terminal (Simulated)";

    if(rideState.pickupLocation && !settingsLoading){
        if (simulatedDropoff) {
            const fare = calculateEstimatedFare(rideState.pickupLocation, simulatedDropoff, rideState.pickupTodaZoneId);

            setRideState(prev => ({
                ...prev,
                dropoffLocation: simulatedDropoff,
                dropoffAddress: simulatedDropoffAddress,
                estimatedFare: fare,
                status: 'confirmingRide',
                currentRideId: `TKT-${Date.now()}-${Math.random().toString(16).slice(2,6)}`
            }));
            if (rideState.pickupLocation) {
              await fetchRoute(rideState.pickupLocation, simulatedDropoff, 'confirmation', false);
              setDropoffInput(simulatedDropoffAddress);
            }
        } else {
             const fallbackDropoff: Coordinates = { latitude: rideState.pickupLocation.latitude + 0.01, longitude: rideState.pickupLocation.longitude + 0.01 };
             const fallbackAddress = "Nearby Location (Simulated)";
             const fare = calculateEstimatedFare(rideState.pickupLocation, fallbackDropoff, rideState.pickupTodaZoneId);
             setRideState(prev => ({
                ...prev,
                dropoffLocation: fallbackDropoff,
                dropoffAddress: fallbackAddress,
                estimatedFare: fare,
                status: 'confirmingRide',
                currentRideId: `TKT-${Date.now()}-${Math.random().toString(16).slice(2,6)}`
             }));
             if (rideState.pickupLocation) {
                await fetchRoute(rideState.pickupLocation, fallbackDropoff, 'confirmation', false);
                setDropoffInput(fallbackAddress);
             }
             handleStatusToast("No Terminal Set", "Using a nearby simulated dropoff. Please set a Terminal Exit Point for this TODA in Dispatcher settings for better defaults.", "destructive");
        }
        addRideUpdate(`Dropoff location set to terminal: ${simulatedDropoffAddress}`);
        handleStatusToast("Dropoff Set to Terminal", "Default dropoff set to terminal. Confirm your ride.");
    }
  }, [rideState.pickupLocation, rideState.pickupTodaZoneId, rideState.dropoffLocation, calculateEstimatedFare, fetchRoute, handleStatusToast, getTodaTerminalExitPoint, settingsLoading, addRideUpdate]);

  const handleShareRide = async () => {
    if (!rideState.currentRideId || rideState.status !== 'inProgress') {
      handleStatusToast("Share Error", "No active ride to share or ride not in progress.", "destructive");
      return;
    }

    let tokenToShare = rideState.shareToken;
    if (!tokenToShare) {
      // Simulate token generation (replace with actual Supabase Edge Function call)
      tokenToShare = Math.random().toString(36).substring(2, 12); // Mock 10-char token
      setRideState(prev => ({ ...prev, shareToken: tokenToShare }));
      console.log(`Simulating Supabase Edge Function call 'generate_share_token' for ride ID: ${rideState.currentRideId}. Generated mock token: ${tokenToShare}`);
    }

    const shareUrl = `https://trigo.live/share/${tokenToShare}`;
    const shareData = {
      title: "Follow my TriGo ride!",
      text: `Track my TriGo ride live. Ticket ID: ${rideState.currentRideId}.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        handleStatusToast("Ride Shared!", "Link sent via share sheet.");
        addRideUpdate("Ride shared with your contacts.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        handleStatusToast("Link Copied!", "Ride tracking link copied to clipboard.");
        addRideUpdate("Ride tracking link copied.");
      }
      console.log("share_ride_clicked", { rideId: rideState.currentRideId, token: tokenToShare });
    } catch (err) {
      console.error("Share failed:", err);
      // Fallback to clipboard if navigator.share fails (e.g. user cancels)
      try {
        await navigator.clipboard.writeText(shareUrl);
        handleStatusToast("Link Copied!", "Sharing failed, link copied to clipboard instead.");
        addRideUpdate("Sharing failed, link copied.");
      } catch (copyErr) {
        handleStatusToast("Share Error", "Could not share or copy link.", "destructive");
        console.error("Clipboard copy failed:", copyErr);
      }
    }
  };


  const countdownColorStyle = { color: PASSENGER_HEADER_TEXT };
  const countdownPulseClass = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 ? `font-bold animate-pulse ${NEON_GREEN_TEXT_TIMER_PULSE}` : `font-bold ${NEON_GREEN_TEXT_TIMER}`;


  if (settingsLoading || !MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        {settingsLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
          <Alert variant="destructive" className="w-full max-w-sm">
            <AlertTitle>Mapbox Token Missing</AlertTitle>
            <AlertDescription>
              Mapbox access token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.
            </AlertDescription>
          </Alert>
        }
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <div className="relative flex flex-col h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('https://placehold.co/1080x1920.png?text=Manila+Traffic+Blur')", backgroundPosition: 'center', backgroundSize: 'cover' }} data-ai-hint="street traffic blur">
        <div className={cn("absolute inset-0 bg-black/50 z-0")}></div>

        <div className="relative z-10 flex flex-col h-full p-6 pt-4">
           <header className="flex justify-end">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <MenuIcon size={28} />
              <span className="sr-only">Menu</span>
            </Button>
          </header>

          <div className="flex-grow flex flex-col items-center justify-center text-center -mt-12 sm:-mt-16">
            <h1 className="text-7xl sm:text-8xl font-bold mb-2" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}}>
              TriGo
            </h1>
            <p className="text-xl sm:text-2xl text-white/80">
              Hello, {rideState.passengerName || "Michelle"}!
            </p>
          </div>


          <div className="pb-4">
            <div className="grid grid-cols-3 gap-4 mb-6 sm:mb-8 max-w-xs sm:max-w-sm mx-auto">
              {[{ label: "Ride", subLabel: "Before", icon: History, action: () => toast({title: "Ride Before", description: "This feature is coming soon!"}) },
               { label: "Ride", subLabel: "Now", icon: Bike, action: () => { setCurrentView('requestingRide'); if(!settingsLoading && !rideState.pickupLocation && !loadedPassengerProfile) { performGeolocation(); } } },
               { label: "Ride", subLabel: "Later", icon: CalendarCheck2, action: () => toast({title: "Ride Later", description: "This feature is coming soon!"}) }
              ].map((item) => (
                <Button
                  key={item.subLabel}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 w-24 rounded-full p-0 border-2 transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 active:scale-95"
                  style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING,
                      color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING,
                      boxShadow: `0 0 10px ${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}33`
                  }}
                  onClick={item.action}
                >
                  <item.icon size={20} className="mb-1"/>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs">{item.subLabel}</span>
                </Button>
              ))}
            </div>
            <footer className="text-center text-sm text-white/70">
              <p className="flex items-center justify-center">
                Selected Payment: <CreditCard size={16} className="mx-1.5" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}}/> {loadedPassengerProfile?.paymentMethod || "Apple Pay"} <span className="ml-1" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}}>{'>'}</span>
              </p>
            </footer>
          </div>
        </div>
      </div>
    );
  } else {
    // requestingRide view
    return (
      <>
      <div className="bg-white text-black flex flex-col h-screen">
        <div style={{ backgroundColor: PASSENGER_HEADER_BG }} className="p-4 flex items-center justify-between shadow-md z-30 relative">
          <div className="flex items-center space-x-2">
            <TriGoPassengerLogoInHeader />
            <h1 className="text-xl font-bold" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}}>TriGo Passenger</h1>
          </div>
          <div className="flex items-center space-x-2">
            { (rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && currentView === 'requestingRide') &&
              <Button variant="ghost" size="icon" onClick={resetRideState} title="Reset Ride" className="text-white hover:bg-white/20 hover:text-white">
                <XCircle size={20} />
              </Button>
            }
            {loadedPassengerProfile && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={loadedPassengerProfile.profilePictureUrl} alt={loadedPassengerProfile.name} data-ai-hint="person face"/>
                  <AvatarFallback>{loadedPassengerProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm hidden sm:inline text-white">{loadedPassengerProfile.name}</span>
              </div>
            )}
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="settings" className="border-b-0">
                <AccordionTrigger className={`p-1.5 hover:no-underline hover:bg-white/20 rounded ${PASSENGER_HEADER_TEXT}`}>
                  <SettingsIconLucide size={20} />
                </AccordionTrigger>
                <AccordionContent className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 text-black dark:text-white rounded-md shadow-lg p-4 z-30">
                  <h3 className="text-lg font-semibold mb-2 text-neutral-700 dark:text-slate-200">My Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="mapStyle" className="text-neutral-600 dark:text-slate-300">Map Style</Label>
                      <Select value={currentPassengerSettings.mapStyle} onValueChange={(value: PassengerMapStyle) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value }))}>
                        <SelectTrigger id="mapStyle" className={cn("mt-1 bg-transparent text-black border-neutral-400")}>
                          <SelectValue placeholder="Select map style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="streets">Streets</SelectItem>
                          <SelectItem value="satellite">Satellite</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSavePassengerSettings} style={{ backgroundColor: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} className="text-white hover:opacity-90 w-full">Save My Settings</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="relative flex-1">
          <Map
            ref={mapRef as any}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
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
                    rideState.pickupTodaZoneId || "", PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING,
                    'hsla(210, 50%, 60%, 0.1)'
                  ],
                  'fill-opacity': ['match', ['get', 'id'], rideState.pickupTodaZoneId || "", 0.3, 0.1],
                  'fill-outline-color': ['match', ['get', 'id'],
                    rideState.pickupTodaZoneId || "", PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING,
                    'hsla(210, 50%, 60%, 0.3)'
                  ],
                }}
              />
              <Layer
                id="toda-zones-border"
                type="line"
                paint={{
                  'line-color': ['match', ['get', 'id'],
                    rideState.pickupTodaZoneId || "", PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING,
                    'hsla(210, 50%, 60%, 0.5)'
                  ],
                  'line-width': 1,
                }}
              />
            </Source>

            {rideState.pickupLocation && (
              <Marker longitude={rideState.pickupLocation.longitude} latitude={rideState.pickupLocation.latitude} anchor="bottom">
                <MapPin size={30} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} fill={PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING} />
              </Marker>
            )}

            {rideState.dropoffLocation && (
              <Marker longitude={rideState.dropoffLocation.longitude} latitude={rideState.dropoffLocation.latitude} anchor="bottom">
                <MapPin size={30} color={"hsl(0, 0%, 40%)"} fill={"hsl(0, 0%, 40%)"} />
              </Marker>
            )}

            {triderSimLocation && rideState.assignedTrider && (
              <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude} anchor="bottom">
                  <Bike size={30} style={{color: triderToPickupRouteColor }} strokeWidth={2.5} />
              </Marker>
            )}

            {rideState.triderToPickupPath && (
              <Source id="trider-to-pickup-route" type="geojson" data={{ type: 'Feature', geometry: rideState.triderToPickupPath, properties: {} }}>
                <Layer
                  id="trider-to-pickup-route-line"
                  type="line"
                  paint={{ 'line-color': triderToPickupRouteColor, 'line-width': 4, 'line-opacity': 0.75 }} />
              </Source>
            )}

            {rideState.pickupToDropoffPath && (
              <Source id="pickup-to-dropoff-route" type="geojson" data={{ type: 'Feature', geometry: rideState.pickupToDropoffPath, properties: {} }}>
                <Layer
                  id="pickup-to-dropoff-route-line"
                  type="line"
                  paint={{ 'line-color': pickupToDropoffRouteColor, 'line-width': 4, 'line-opacity': 0.75 }} />
              </Source>
            )}
          </Map>

          {/* Bottom Floating Input Card */}
          {(rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
            <div className={cn(
                "fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-md z-10",
                "p-3 pb-safe",
                "bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg",
                "border border-slate-300 dark:border-slate-700/60",
                "rounded-t-xl sm:rounded-xl shadow-2xl",
                "shadow-[0_0_20px_hsl(var(--primary)_/_0.3),_0_0_40px_hsl(var(--primary)_/_0.2)] dark:shadow-[0_0_20px_hsl(var(--primary)_/_0.3),_0_0_40px_hsl(var(--primary)_/_0.2)]"
              )}
              style={{ '--input-card-height': (rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide' || rideState.status === 'selectingPickup' ? '140px' : '80px') } as React.CSSProperties}
            >
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-0 space-y-2">
                  <div className="relative">
                    <Input
                      type="text" placeholder="Enter Pickup Location" value={pickupInput}
                      onChange={(e) => { setPickupInput(e.target.value); handleGeocodeSearch(e.target.value, 'pickup'); }}
                      onFocus={() => setActiveSuggestionBox('pickup')}
                      className={cn(`w-full shadow-sm pr-10 bg-white border-neutral-300 placeholder:text-neutral-500`, PASSENGER_INPUT_TEXT_COLOR, PASSENGER_PLACEHOLDER_TEXT_COLOR)}
                      disabled={rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide'} />
                      <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />

                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-neutral-600 hover:bg-neutral-200" onClick={() => performGeolocation(true)} disabled={isGeolocating}>
                      {isGeolocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair size={18} />}
                    </Button>
                    {isSearchingAddress && activeSuggestionBox === 'pickup' && pickupInput.length > 0 && (
                      <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-neutral-500" />
                    )}
                    {pickupSuggestions.length > 0 && activeSuggestionBox === 'pickup' && (
                      <Card className="absolute bottom-full mb-1 w-full shadow-lg z-30 bg-white">
                        <CardContent className="p-0 max-h-48 overflow-y-auto">
                          {pickupSuggestions.map(suggestion => (
                            <div key={suggestion.id} className={cn(`p-3 cursor-pointer hover:bg-neutral-100 border-b border-neutral-200 last:border-b-0`, PASSENGER_INPUT_TEXT_COLOR)} onClick={() => handleSuggestionSelect(suggestion, 'pickup')}>
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
                        className={cn(`w-full shadow-sm pr-10 bg-white border-neutral-300 placeholder:text-neutral-500`, PASSENGER_INPUT_TEXT_COLOR, PASSENGER_PLACEHOLDER_TEXT_COLOR)}
                        disabled={rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide' && rideState.dropoffLocation !== null} />
                      <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />

                      {isSearchingAddress && activeSuggestionBox === 'dropoff' && dropoffInput.length > 0 && ( <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-neutral-500" /> )}
                      {dropoffSuggestions.length > 0 && activeSuggestionBox === 'dropoff' && (
                        <Card className="absolute bottom-full mb-1 w-full shadow-lg z-20 bg-white">
                          <CardContent className="p-0 max-h-48 overflow-y-auto">
                            {dropoffSuggestions.map(suggestion => (
                              <div key={suggestion.id} className={cn(`p-3 cursor-pointer hover:bg-neutral-100 border-b border-neutral-200 last:border-b-0`, PASSENGER_INPUT_TEXT_COLOR)} onClick={() => handleSuggestionSelect(suggestion, 'dropoff')}>
                                {suggestion.place_name}
                              </div> ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {rideState.status === 'selectingDropoff' && rideState.pickupLocation && !rideState.dropoffLocation && !settingsLoading && (
            <div className="fixed bottom-[calc(var(--input-card-height,100px)_+_1rem)] left-1/2 transform -translate-x-1/2 z-20">
                <NeonTrikeCtaButton onClick={handleSimulateDropoffForPickMeUp} />
            </div>
          )}

          {(rideState.status === 'confirmingRide' || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
            <div
              className="fixed bottom-[calc(var(--input-card-height,140px)_+_1rem)] sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-sm px-4 sm:px-0"
              style={{ '--status-card-height': (rideState.status === 'confirmingRide' ? '220px' : '200px') } as React.CSSProperties }
            >
              <Alert
                className={cn(
                  "p-4 backdrop-blur-md shadow-xl rounded-xl text-center",
                  PASSENGER_FLOATING_CARD_BG_DARK_GLASS,
                  PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS
                )}
                style={{ borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING, borderWidth: '1.5px' }}
              >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <Ticket size={20} style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}} />
                        <AlertTitle style={{color: PASSENGER_HEADER_TEXT}} className="font-semibold">
                            {rideState.status === 'confirmingRide' && 'Confirm Ride'}
                            {rideState.status === 'searching' && 'Finding TriDer...'}
                            {rideState.status === 'triderAssigned' && `TriDer En Route`}
                            {rideState.status === 'inProgress' && `Ride In Progress`}
                        </AlertTitle>
                    </div>
                    {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.countdownSeconds !== null && (
                        <div
                            className={`text-2xl ${countdownPulseClass}`}
                            style={{color: PASSENGER_HEADER_TEXT }}
                        >
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
                            {rideState.currentRideId && <p className="text-xs">Ride Ticket #: {rideState.currentRideId}</p>}
                            <div className="flex justify-center pt-2">
                              <NeonTrikeCtaButton onClick={handlePickMeUpNow} disabled={!rideState.pickupLocation || !rideState.dropoffLocation || rideState.estimatedFare === null} />
                            </div>
                        </>
                    )}
                    {(rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.currentRideId &&
                        <p className="text-xs">Ride Ticket #: {rideState.currentRideId}</p>
                    }
                    {rideState.status === 'searching' && <p>Searching for the nearest available trider for you...</p>}
                    {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                        <>
                            <p>Trider: {rideState.assignedTrider.name} (#{rideState.assignedTrider.bodyNumber}, {rideState.assignedTrider.vehicleType})</p>
                        </>
                    )}
                    {rideState.status === 'inProgress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareRide}
                        className="mt-2 text-white border-white/50 hover:bg-white/10 hover:text-white"
                      >
                        <Share2 className="mr-2 h-4 w-4" /> Share Ride
                      </Button>
                    )}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {rideUpdates.length > 0 && (rideState.status !== 'confirmingRide' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff') && (
            <Card
              className={cn(
                "fixed left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm backdrop-blur-sm shadow-xl rounded-xl text-white max-h-[150px] overflow-y-auto",
                PASSENGER_FLOATING_CARD_BG_DARK_GLASS, PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS
              )}
              style={{
                bottom: 'calc(var(--status-card-height, 180px) + var(--input-card-height, 120px) + 2rem)',
                borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING, borderWidth: '1px',
                '--ride-updates-card-height': '150px'
              } as React.CSSProperties}
            >
              <CardContent className="p-3 text-xs space-y-1">
                <div className="flex items-center text-white/80 mb-1">
                  <History size={14} className="mr-1" />
                  <span>Ride Updates</span>
                </div>
                {rideUpdates.map((update, index) => (
                  <p key={index} className="border-b border-white/20 dark:border-slate-700/50 last:border-b-0 pb-1 last:pb-0">{update}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {rideState.status === 'completed' && (
              <div className="fixed bottom-[calc(var(--bottom-nav-height,60px)+1rem)] left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs px-4">
                  <Button style={{ backgroundColor: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} className="w-full text-white hover:opacity-90" onClick={() => { resetRideState(); setIsReceiptDialogOpen(false); }}>
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
            if (!isOpen) resetRideState();
          }}
          rideDetails={completedRideDetails}
        />
      )}

      <style jsx global>{`
          :root {
            --bottom-nav-height: 0px;
            --input-card-height: ${
              rideState.status === 'selectingDropoff' ||
              rideState.status === 'confirmingRide' ||
              rideState.status === 'selectingPickup'
                ? '140px'
                : '80px'
            };
            --status-card-height: ${
              rideState.status === 'triderAssigned' || rideState.status === 'inProgress'
                ? '200px'
                : rideState.status === 'confirmingRide'
                  ? '220px'
                  : '0px'
            };
            --ride-updates-card-height: 150px;
          }
          @media (max-width: 640px) { /* sm breakpoint */
            :root {
              --input-card-height: ${
                rideState.status === 'selectingDropoff' ||
                rideState.status === 'confirmingRide' ||
                rideState.status === 'selectingPickup'
                  ? '120px'
                  : '60px'
              };
              --status-card-height: ${
                rideState.status === 'triderAssigned' || rideState.status === 'inProgress'
                  ? '180px'
                  : rideState.status === 'confirmingRide'
                    ? '200px'
                    : '0px'
              };
              --ride-updates-card-height: 120px;
            }
          }
        `}</style>
      </>
    );
  }
}
