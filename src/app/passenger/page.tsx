"use client";

import * as React from 'react';
import {
  MapPin, Search, User, ArrowRight, CircleDollarSign, Clock, Loader2, Ticket, Settings as SettingsIconLucide, Crosshair, Globe, Grid, LogIn as LogInIcon, XCircle, Menu as MenuIcon, History, CalendarCheck2, CreditCard, Bike, Star, Share2, ChevronRight
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
import { motion, AnimatePresence } from "framer-motion"
import { todaZones as appTodaZones } from "@/data/todaZones";
import { getRandomPointInCircle, calculateDistance, isPointInCircle } from "@/lib/geoUtils";
import { useSettings } from "@/contexts/SettingsContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { RideReceiptDialog } from '@/components/passenger/RideReceiptDialog';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import AdminChatManager from "@/components/chat/AdminChatManager";
import { useState, useEffect } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2';

const PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING = 'hsl(280, 80%, 70%)'; // Purple
const PASSENGER_HEADER_BG = 'black';
const PASSENGER_HEADER_TEXT = 'white';
const PASSENGER_INPUT_TEXT_COLOR = 'text-neutral-100 dark:text-neutral-100';
const PASSENGER_PLACEHOLDER_TEXT_COLOR = 'placeholder:text-neutral-400 dark:placeholder:text-neutral-400';
const PASSENGER_FLOATING_CARD_BG_DARK_GLASS = 'bg-black/70 backdrop-blur-md';
const PASSENGER_FLOATING_CARD_BORDER_DARK_GLASS = 'border-slate-700/50';
const PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS = 'shadow-2xl shadow-purple-500/20';

const NEON_GREEN_TEXT_TIMER = 'text-lime-400'; // Maintained for timer card on dark bg

const DEFAULT_PASSENGER_MAP_STYLE: PassengerMapStyle = 'streets';

let bodyNumberCounter = 100;
const generatePassengerMockBodyNumber = () => {
  bodyNumberCounter++;
  return bodyNumberCounter.toString().padStart(3, '0');
};

const mockTridersForDemo: TriderProfile[] = [
  'Peter TK', 'Andrew TK', 'James Z. TK', 'John TK', 'Philip TK'
].map((name, index): TriderProfile => {
  const zone = appTodaZones.find(z => z.id === TALON_KUATRO_ZONE_ID);
  if (!zone) throw new Error("Talon Kuatro zone with ID " + TALON_KUATRO_ZONE_ID + " not found for mock triders.");
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
    isOnline: true
  };
});

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

function formatCountdown(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const TriGoPassengerLogoInHeader = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
    <circle cx="16" cy="16" r="13" stroke={PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING} strokeWidth="1.5" />
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <path d="M9.5 12 Q16 8 22.5 12 L19.5 12" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
    <circle cx="12" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none" />
    <circle cx="17" cy="20.5" r="1.5" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1" fill="none" />
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

  const [isChatVisible, setIsChatVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [currentView, setCurrentView] = React.useState<'landing' | 'requestingRide'>('landing');

  const [loadedPassengerProfile, setLoadedPassengerProfile] = React.useState<MockPassengerProfile | null>(null);
  const [currentPassengerSettings, setCurrentPassengerSettings] = React.useState<PassengerSettings | undefined>(loadedPassengerProfile?.settings);
  const [mapStyleUrl, setMapStyleUrl] = React.useState('mapbox://styles/mapbox/streets-v12');
  const [isRefreshingEta, setIsRefreshingEta] = React.useState(false);

  const toastShownForStatus = React.useRef<Record<string, boolean>>({});

  const [viewState, setViewState] = React.useState({
    longitude: defaultMapCenter.longitude,
    latitude: defaultMapCenter.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45
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
    shareToken: null
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

  const [triderToPickupRouteColor, setTriderToPickupRouteColor] = React.useState('hsl(var(--accent))'); // Default Accent Green
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING); // Passenger Purple

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
      setPickupToDropoffRouteColor(PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING); // This is already a direct HSL string
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


  const getRouteDuration = React.useCallback(async (start: Coordinates, end: Coordinates): Promise<number | null> => {
    if (!MAPBOX_TOKEN || !start || !end) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?overview=simplified&alternatives=true&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
         const chosenRoute = data.routes.length > 1
            ? data.routes.reduce((shortest: any, current: any) => current.distance < shortest.distance ? current : shortest)
            : data.routes[0];
        return Math.round(chosenRoute.duration) || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching route duration:", error);
      return null;
    }
  }, [MAPBOX_TOKEN]);

  const fetchRoute = React.useCallback(async (start: Coordinates, end: Coordinates, routeType: 'triderToPickup' | 'pickupToDropoff', updateCountdown: boolean = false) => {
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
        
        const path: RoutePath = chosenRoute.geometry;
        const durationSeconds = Math.round(chosenRoute.duration);
        setRideState(prev => ({
          ...prev,
          [routeType === 'triderToPickup' ? 'triderToPickupPath' : 'pickupToDropoffPath']: path,
          ...(updateCountdown && { countdownSeconds: durationSeconds, estimatedDurationSeconds: durationSeconds }),
        }));
        if (updateCountdown) {
          addRideUpdate(`ETA to ${routeType === 'triderToPickup' ? 'pickup' : 'destination'}: ${Math.round(durationSeconds / 60)} min.`);
        }
      } else {
        handleStatusToast("Route Error", data.message || "Could not calculate route.", "destructive");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      handleStatusToast("Route Error", "Failed to fetch route.", "destructive");
    }
  }, [MAPBOX_TOKEN, handleStatusToast, addRideUpdate]);

  const performGeolocation = React.useCallback(async (setAsPickup = true) => {
    if (settingsLoading) {
      setIsGeolocating(false);
      return null;
    }
    if (!navigator.geolocation || !MAPBOX_TOKEN) {
      handleStatusToast("Geolocation Unavailable", "Your browser does not support geolocation or Mapbox token is missing.", "destructive");
      return null;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
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
            setPickupSuggestions([]);
            if (newDropoffLocation) setDropoffInput(newDropoffAddress);
            addRideUpdate(`Pickup location set by map click: ${address}`);
            if (pickupZone?.name) addRideUpdate(`Identified pickup zone: ${pickupZone.name}`);

            let toastDesc = `Zone: ${pickupZone?.name || 'N/A'}.`;
            if (newDropoffLocation && coords && !settingsLoading){
                const fare = calculateEstimatedFare(coords, newDropoffLocation, pickupZone?.id || null);
                const duration = await fetchRoute(coords, newDropoffLocation, 'pickupToDropoff', true);
                setRideState(prev => ({...prev, estimatedFare: fare}));
                toastDesc += ` Default dropoff set to ${pickupZone?.name || ''} Terminal.`;
            } else {
                toastDesc += " Now select your dropoff location.";
            }
            handleStatusToast("Pickup Set by Geolocation", toastDesc);
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
    return null;
  }, [MAPBOX_TOKEN, handleStatusToast, getTodaZoneForLocation, calculateEstimatedFare, fetchRoute, getTodaTerminalExitPoint, settingsLoading, addRideUpdate]);

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
      shareToken: null
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
          const tempProfile: MockPassengerProfile = {
            id: `temp-pass-${Date.now()}`,
            name: 'Valued Passenger',
            todaZoneId: zone.id,
            todaZoneName: zone.name,
            settings: { mapStyle: DEFAULT_PASSENGER_MAP_STYLE }
          };
          setLoadedPassengerProfile(tempProfile);
          setRideState(prev => ({ ...prev, passengerName: tempProfile.name, pickupTodaZoneId: zone.id, status: 'selectingPickup' }));
          setCurrentPassengerSettings(tempProfile.settings || { mapStyle: DEFAULT_PASSENGER_MAP_STYLE });
          setViewState(prev => ({ ...prev, ...zone.center, zoom: 15 }));
          setCurrentView('requestingRide'); // Directly go to requesting view if zone is pre-selected
          if (!settingsLoading && !rideState.pickupLocation) {
            performGeolocation(); // Then attempt geolocation for this zone
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
          setCurrentView('requestingRide'); // Directly go to requesting view
          if (!settingsLoading && !rideState.pickupLocation) {
             performGeolocation();
          }
        }
      }
      localStorage.removeItem('selectedTodaZoneId_TriGo');
      localStorage.removeItem('selectedTodaZoneName_TriGo');
      localStorage.removeItem('selectedRole_TriGo');
      localStorage.removeItem('selectedPassengerProfile');
    } catch (error) {
      console.error("Error loading passenger/zone info from localStorage:", error);
    }
  }, [performGeolocation, settingsLoading, rideState.pickupLocation]);


  React.useEffect(() => {
    switch (currentPassengerSettings?.mapStyle) {
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
  }, [currentPassengerSettings?.mapStyle]);

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
        zoom: defaultMapZoom + 1
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

  // Periodic ETA Refresh Effect
  React.useEffect(() => {
    let etaRefreshIntervalId: NodeJS.Timeout;
    if ((rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && triderSimLocation && rideState.pickupLocation && rideState.dropoffLocation) {
      etaRefreshIntervalId = setInterval(async () => {
        if (isRefreshingEta) return;
        setIsRefreshingEta(true);
        
        const currentTarget = rideState.status === 'triderAssigned' ? rideState.pickupLocation : rideState.dropoffLocation;
        if (!currentTarget || !triderSimLocation) {
          setIsRefreshingEta(false);
          return;
        }

        const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
        const atDestinationOfSegment = currentPath && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

        if (atDestinationOfSegment) { // Don't refresh if already at destination of segment
          setIsRefreshingEta(false);
          return;
        }

        const newDuration = await getRouteDuration(triderSimLocation, currentTarget);
        if (newDuration !== null) {
          setRideState(prev => ({
            ...prev,
            estimatedDurationSeconds: newDuration,
            countdownSeconds: newDuration, // Reset countdown with new ETA
          }));
        }
        setIsRefreshingEta(false);
      }, 7000); // Refresh ETA every 7 seconds
    }
    return () => clearInterval(etaRefreshIntervalId);
  }, [rideState.status, triderSimLocation, rideState.pickupLocation, rideState.dropoffLocation, getRouteDuration, isRefreshingEta]);


  React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;

    const triderMovementLogic = () => {
      setTriderSimLocation(prevSimLoc => {
        if (!prevSimLoc) return prevSimLoc;

        const currentPath = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
        const targetLocation = rideState.status === 'triderAssigned' ? rideState.pickupLocation! : rideState.dropoffLocation!;

        if (!currentPath || !targetLocation || rideState.currentTriderPathIndex === undefined) return prevSimLoc;

        const atDestinationOfSegment = rideState.currentTriderPathIndex >= currentPath.coordinates.length - 1;

        if (atDestinationOfSegment) {
          if (rideState.countdownSeconds !== 0) {
            setRideState(prevRide => ({ ...prevRide, countdownSeconds: 0 }));
          }
          if (prevSimLoc.longitude !== targetLocation.longitude || prevSimLoc.latitude !== targetLocation.latitude) {
            return targetLocation;
          }
          return prevSimLoc;
        }

        let nextIndex = rideState.currentTriderPathIndex + 1;
        const newCoords: Coordinates = {
          longitude: currentPath.coordinates[nextIndex][0],
          latitude: currentPath.coordinates[nextIndex][1]
        };
        setRideState(prev => ({ ...prev, currentTriderPathIndex: nextIndex }));
        return newCoords;
      });
    };

    if (triderSimLocation && rideState.pickupLocation && rideState.dropoffLocation &&
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
  ]);


  const prevRideStatusForToastsRef = React.useRef<PassengerRideState['status']>();
  React.useEffect(() => {
    const currentStatus = rideState.status;
    const prevStatus = prevRideStatusForToastsRef.current;

    if (prevStatus !== currentStatus) {
      const toastKeyPrefix = rideState.currentRideId || 'ride';
      const toastKey = `${currentStatus}-${toastKeyPrefix}`;

      if (!toastShownForStatus.current[toastKey]) {
        let title = "";
        let description = "";
        switch (currentStatus) {
          case 'triderAssigned':
            title = "TriDer Assigned!";
            description = `TriDer ${rideState.assignedTrider?.name} (#${rideState.assignedTrider?.bodyNumber}) is on their way.`;
            if (!toastShownForStatus.current[`triderAssignedUpdate-${toastKeyPrefix}`]) {
              addRideUpdate(`TriDer ${rideState.assignedTrider?.name || ''} (#${rideState.assignedTrider?.bodyNumber || ''}) is assigned and en route to you.`);
              toastShownForStatus.current[`triderAssignedUpdate-${toastKeyPrefix}`] = true;
            }
            break;
          case 'inProgress':
             title = "Trider Arrived for Pickup!";
             description = `${rideState.assignedTrider?.name} (#${rideState.assignedTrider?.bodyNumber}) is here. Heading to destination.`;
            if (!toastShownForStatus.current[`inProgressUpdate-${toastKeyPrefix}`]) {
              addRideUpdate(`TriDer ${rideState.assignedTrider?.name || ''} arrived at your pickup location.`);
              toastShownForStatus.current[`inProgressUpdate-${toastKeyPrefix}`] = true;
            }
            break;
          case 'completed':
            title = "Ride Completed!";
            description = `Thank you for riding with TriGo, ${rideState.passengerName}!`;
            if (!toastShownForStatus.current[`completedUpdate-${toastKeyPrefix}`]) {
                addRideUpdate(`Ride to ${rideState.dropoffAddress} completed.`);
                toastShownForStatus.current[`completedUpdate-${toastKeyPrefix}`] = true;
            }
            break;
        }
        if (title && description) {
          handleStatusToast(title, description);
          toastShownForStatus.current[toastKey] = true;
        }
      }
    }
    prevRideStatusForToastsRef.current = currentStatus;
  }, [rideState.status, rideState.currentRideId, rideState.assignedTrider, rideState.passengerName, handleStatusToast, addRideUpdate, rideState.dropoffAddress]);


  React.useEffect(() => {
    const currentStatus = rideState.status;
    const pathToCheck = currentStatus === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
    const atDestinationOfSegment = pathToCheck && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= pathToCheck.coordinates.length - 1;

    if (currentStatus === 'triderAssigned' && atDestinationOfSegment) {
      if (rideState.dropoffLocation && rideState.pickupLocation) {
        setRideState(prev => ({ ...prev, countdownSeconds: 0 }));
        fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true).then(() => {
          setRideState(prev => ({ ...prev, status: 'inProgress', currentTriderPathIndex: 0 }));
        });
      }
    } else if (currentStatus === 'inProgress' && atDestinationOfSegment) {
      setRideState(prev => ({ ...prev, countdownSeconds: 0 }));
      const now = new Date();
      const finalRideState: PassengerRideState = { ...rideState, status: 'completed' as const, completionTime: now };
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
    setIsReceiptDialogOpen
  ]);

  const handleMapClick = async (event: mapboxgl.MapLayerMouseEvent) => {
    if (settingsLoading) return;
    const clickedCoords = { longitude: event.lngLat.lng, latitude: event.lngLat.lat };
    const clickedZone = getTodaZoneForLocation(clickedCoords);

    if (!clickedZone) {
        handleStatusToast("Outside Service Area", "The selected location is outside any TODA zone.", "destructive");
        return;
    }

    let newAddress = `${clickedCoords.latitude.toFixed(4)}, ${clickedCoords.longitude.toFixed(4)}`;
    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${clickedCoords.longitude},${clickedCoords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&limit=1`);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            newAddress = data.features[0].place_name;
        }
    } catch (error) {
        console.error("Error reverse geocoding map click:", error);
    }
    
    if (rideState.status === 'selectingPickup') {
      const terminal = getTodaTerminalExitPoint(clickedZone.id);
      const simulatedDropoff = terminal?.point || null;
      const simulatedDropoffAddress = terminal?.address || '';

      setRideState(prev => ({
        ...prev,
        pickupLocation: clickedCoords,
        pickupAddress: newAddress,
        status: simulatedDropoff ? 'confirmingRide' : 'selectingDropoff',
        pickupTodaZoneId: clickedZone.id,
        dropoffLocation: simulatedDropoff,
        dropoffAddress: simulatedDropoffAddress
      }));
      setPickupInput(newAddress);
      setPickupSuggestions([]);
      if (simulatedDropoff) setDropoffInput(simulatedDropoffAddress);
      addRideUpdate(`Pickup location set by map click: ${newAddress}`);
      addRideUpdate(`Identified pickup zone: ${clickedZone.name}`);

      let toastDesc = `Zone: ${clickedZone.name}.`;
      if (simulatedDropoff && clickedCoords && !settingsLoading){
        const fare = calculateEstimatedFare(clickedCoords, simulatedDropoff, clickedZone.id);
        const duration = await fetchRoute(clickedCoords, simulatedDropoff, 'pickupToDropoff', true);
        setRideState(prev => ({...prev, estimatedFare: fare}));
        toastDesc += ` Default dropoff set to ${clickedZone.name} Terminal.`;
      } else {
          toastDesc += " Now select your dropoff location.";
      }
      handleStatusToast("Pickup Set by Map Click", toastDesc);
      handleLocationSelect(clickedCoords, 'pickup');

    } else if (rideState.status === 'selectingDropoff' && rideState.pickupLocation) {
      if (rideState.pickupTodaZoneId !== clickedZone.id && calculateDistance(rideState.pickupLocation, clickedCoords) > (appTodaZones.find(z => z.id === rideState.pickupTodaZoneId)?.radiusKm || 1) * 2) {
         handleStatusToast("Dropoff Out of Zone", "Please select a dropoff location closer to your pickup zone.", "destructive");
         return;
      }
      setRideState(prev => ({ ...prev, dropoffLocation: clickedCoords, dropoffAddress: newAddress, status: 'confirmingRide' }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
      addRideUpdate(`Dropoff location set by map click: ${newAddress}`);
      handleStatusToast("Dropoff Set by Map Click", "Confirm your ride details.");
      if (rideState.pickupLocation && !settingsLoading) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, clickedCoords, rideState.pickupTodaZoneId);
        await fetchRoute(rideState.pickupLocation, clickedCoords, 'pickupToDropoff', true);
        setRideState(prev => ({ ...prev, estimatedFare: fare }));
      }
      handleLocationSelect(clickedCoords, 'dropoff');
    }
  };

  const handlePickMeUpNow = React.useCallback(async () => {
    if (!rideState.pickupLocation || settingsLoading) {
      handleStatusToast("Pickup Not Set", "Please set your pickup location first.", "destructive");
      return;
    }
    
    let dropoffLoc = rideState.dropoffLocation;
    let dropoffAddr = rideState.dropoffAddress;

    if (!dropoffLoc && rideState.pickupTodaZoneId) {
      const terminal = getTodaTerminalExitPoint(rideState.pickupTodaZoneId);
      if (terminal?.point && terminal?.address) {
        dropoffLoc = terminal.point;
        dropoffAddr = terminal.address;
        setDropoffInput(dropoffAddr);
        addRideUpdate(`Default dropoff set to ${appTodaZones.find(z => z.id === rideState.pickupTodaZoneId)?.name} Terminal.`);
        handleStatusToast("Default Dropoff Set", `Using ${appTodaZones.find(z => z.id === rideState.pickupTodaZoneId)?.name} Terminal as destination.`);
      } else {
        handleStatusToast("Dropoff Not Set", "Please set your dropoff location or ensure a terminal point is configured for your TODA zone.", "destructive");
        return;
      }
    }
    
    if (!dropoffLoc) {
      handleStatusToast("Dropoff Not Set", "Please select a dropoff location.", "destructive");
      return;
    }

    const fare = calculateEstimatedFare(rideState.pickupLocation, dropoffLoc, rideState.pickupTodaZoneId);
    await fetchRoute(rideState.pickupLocation, dropoffLoc, 'pickupToDropoff', true);
    
    toastShownForStatus.current = {}; // Reset toast flags for the new ride sequence
    setRideState(prev => ({
      ...prev,
      dropoffLocation: dropoffLoc,
      dropoffAddress: dropoffAddr,
      estimatedFare: fare,
      status: 'confirmingRide',
      currentRideId: `RIDE-SIM-${Date.now()}`
    }));
    addRideUpdate("Confirm your ride details below.");
    setViewState(prev => ({ ...prev, ...rideState.pickupLocation!, zoom: 15, pitch: 45 }));
  }, [rideState.pickupLocation, rideState.dropoffLocation, rideState.dropoffAddress, rideState.pickupTodaZoneId, getTodaTerminalExitPoint, calculateEstimatedFare, fetchRoute, handleStatusToast, settingsLoading, addRideUpdate]);
  
  const handleConfirmRide = React.useCallback(async () => {
    if (!rideState.pickupLocation || !rideState.dropoffLocation || !rideState.pickupTodaZoneId || settingsLoading) return;

    toastShownForStatus.current = {}; // Ensure toasts for this new ride sequence can fire
    setRideState(prev => ({ ...prev, status: 'searching' }));
    addRideUpdate("Searching for a TriDer...");
    handleStatusToast("Searching for TriDer...", "Please wait while we find a TriDer for you.");

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate searching
    
    const availableTridersInZone = mockTridersForDemo.filter(
        t => t.todaZoneId === rideState.pickupTodaZoneId && t.status === 'available'
    );

    if (availableTridersInZone.length === 0) {
        handleStatusToast("No TriDers Available", `No TriDers found in ${appTodaZones.find(z=>z.id === rideState.pickupTodaZoneId)?.name}. Please try again later.`, "destructive");
        setRideState(prev => ({ ...prev, status: 'selectingDropoff' })); // Or back to 'idle' or 'selectingPickup'
        return;
    }

    const assignedTrider = availableTridersInZone[Math.floor(Math.random() * availableTridersInZone.length)];
    setTriderSimLocation(assignedTrider.location);

    await fetchRoute(assignedTrider.location, rideState.pickupLocation, 'triderToPickup', true);
    
    setRideState(prev => ({
      ...prev,
      status: 'triderAssigned',
      assignedTrider,
      currentTriderPathIndex: 0,
    }));
    addRideUpdate(`TriDer ${assignedTrider.name} (#${assignedTrider.bodyNumber}) is on the way.`);
    // Toast for 'triderAssigned' will be handled by the useEffect hook listening to status changes
  }, [rideState.pickupLocation, rideState.dropoffLocation, rideState.pickupTodaZoneId, fetchRoute, handleStatusToast, settingsLoading, addRideUpdate]);

  const handleCancelRide = () => {
    resetRideState();
    handleStatusToast("Ride Cancelled", "Your ride request has been cancelled.");
  };

  const handleAddressSearch = async (type: 'pickup' | 'dropoff', query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=PH&proximity=ip&limit=5`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (type === 'pickup') {
        setPickupSuggestions(data.features || []);
      } else {
        setDropoffSuggestions(data.features || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type} suggestions:`, error);
      handleStatusToast("Address Search Error", `Could not fetch ${type} suggestions.`, "destructive");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectSuggestion = async (type: 'pickup' | 'dropoff', feature: MapboxGeocodingFeature) => {
    if (settingsLoading) return;
    const coords: Coordinates = { longitude: feature.center[0], latitude: feature.center[1] };
    const address = feature.place_name;
    const zone = getTodaZoneForLocation(coords);

    if (type === 'pickup') {
      if (!zone) {
        handleStatusToast("Outside Service Area", "Selected pickup is outside any TODA zone.", "destructive");
        return;
      }
      const terminal = getTodaTerminalExitPoint(zone.id);
      const newDropoffLocation = terminal?.point || null;
      const newDropoffAddress = terminal?.address || '';

      setRideState(prev => ({
        ...prev,
        pickupLocation: coords,
        pickupAddress: address,
        status: newDropoffLocation ? 'confirmingRide' : 'selectingDropoff',
        pickupTodaZoneId: zone.id,
        dropoffLocation: newDropoffLocation,
        dropoffAddress: newDropoffAddress
      }));
      setPickupInput(address);
      if (newDropoffLocation) setDropoffInput(newDropoffAddress);
      addRideUpdate(`Pickup location set: ${address}`);
      addRideUpdate(`Identified pickup zone: ${zone.name}`);

      if (newDropoffLocation && coords && !settingsLoading) {
        const fare = calculateEstimatedFare(coords, newDropoffLocation, zone.id);
        await fetchRoute(coords, newDropoffLocation, 'pickupToDropoff', true);
        setRideState(prev => ({ ...prev, estimatedFare: fare }));
      }
    } else if (rideState.pickupLocation) {
        if (rideState.pickupTodaZoneId !== zone?.id && calculateDistance(rideState.pickupLocation, coords) > (appTodaZones.find(z => z.id === rideState.pickupTodaZoneId)?.radiusKm || 1) * 2.5) { // Allow slightly larger radius for dropoff flexibility
             handleStatusToast("Dropoff Too Far", "Please select a dropoff location closer to your pickup zone.", "destructive");
             return;
        }
      setRideState(prev => ({ ...prev, dropoffLocation: coords, dropoffAddress: address, status: 'confirmingRide' }));
      setDropoffInput(address);
      addRideUpdate(`Dropoff location set: ${address}`);
      if (rideState.pickupLocation && !settingsLoading) {
        const fare = calculateEstimatedFare(rideState.pickupLocation, coords, rideState.pickupTodaZoneId);
        await fetchRoute(rideState.pickupLocation, coords, 'pickupToDropoff', true);
        setRideState(prev => ({ ...prev, estimatedFare: fare }));
      }
    }
    handleLocationSelect(coords, type);
    setActiveSuggestionBox(null);
  };

  const handleShareRide = async () => {
    if (!rideState.currentRideId) return;

    let tokenToShare = rideState.shareToken;
    if (!tokenToShare) {
      // Simulate token generation
      tokenToShare = Math.random().toString(36).substring(2, 12).toUpperCase();
      setRideState(prev => ({...prev, shareToken: tokenToShare }));
      console.log(`Simulating: Call Supabase Edge Function generate_share_token for ride ID: ${rideState.currentRideId}. Generated mock token: ${tokenToShare}`);
      addRideUpdate(`Share link generated for ride ${rideState.currentRideId}`);
    }
    
    const shareUrl = `${window.location.origin}/share/${tokenToShare}`;
    const shareData = {
      title: "Follow my TriGo Ride!",
      text: `Track ${rideState.passengerName}'s TriGo ride live! From: ${rideState.pickupAddress} To: ${rideState.dropoffAddress}. Trider: ${rideState.assignedTrider?.name || 'N/A'} (#${rideState.assignedTrider?.bodyNumber || 'N/A'})`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        handleStatusToast("Ride Shared!", "Link sent successfully.");
        addRideUpdate("Ride link shared via native share.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        handleStatusToast("Link Copied!", "Ride tracking link copied to clipboard.");
        addRideUpdate("Ride link copied to clipboard.");
      }
      console.log("share_ride_clicked", { rideId: rideState.currentRideId, token: tokenToShare });
    } catch (err) {
      console.error("Share failed:", err);
      handleStatusToast("Share Failed", "Could not share ride link.", "destructive");
    }
  };

  const handleLocationSelect = React.useCallback((coords: { latitude: number; longitude: number }, type: 'pickup' | 'dropoff') => {
    setViewState(prev => ({ ...prev, ...coords, zoom: 16 }));
    type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
    setActiveSuggestionBox(null);
  }, []);


  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="ml-2 text-purple-600">Loading passenger experience...</p>
      </div>
    );
  }
  
  const mainButtonColorClass = `bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}] hover:bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]/90 text-white`;
  const mainAccentTextClass = `text-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`;
  const mainAccentBorderClass = `border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`;
  const countdownColorStyle = { color: PASSENGER_HEADER_TEXT }; // White for timer digits
  const countdownPulseClass = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10
    ? "font-bold animate-pulse"
    : "font-semibold";

  const currentPathForProgress = rideState.status === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
  const progressValue = currentPathForProgress && rideState.currentTriderPathIndex !== undefined && currentPathForProgress.coordinates.length > 0
    ? (rideState.currentTriderPathIndex / (currentPathForProgress.coordinates.length - 1)) * 100
    : 0;
  
  if (currentView === 'landing') {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://placehold.co/1080x1920.png?text=Manila+Traffic+Blur')" }}
          data-ai-hint="street traffic blur"
        />
        {/* Overlay for text legibility */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full text-white p-6 sm:p-8">
          <header className="flex justify-between items-center mb-8">
             {/* Placeholder for a small logo or menu if needed */}
             <div className="w-8 h-8"></div> {/* Spacer */}
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
              <MenuIcon size={28} />
            </Button>
          </header>

          <div className="flex-grow flex flex-col items-center justify-center text-center -mt-12 sm:-mt-16">
            <h1 className={`text-7xl sm:text-8xl font-bold ${mainAccentTextClass}`} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }}>TriGo</h1>
            <p className="text-xl sm:text-2xl text-white/80 mt-1">Hello, {rideState.passengerName}!</p>
          </div>

          <div className="pb-6 sm:pb-8">
            <div className="grid grid-cols-3 gap-4 max-w-xs sm:max-w-sm mx-auto mb-6 sm:mb-8">
              {["Ride Before", "Ride Now", "Ride Later"].map((label, idx) => (
                <Button
                  key={label}
                  variant="outline"
                  className={`aspect-square h-auto w-full p-0 rounded-full flex flex-col items-center justify-center 
                              bg-white/10 backdrop-blur-sm border-2 ${idx === 1 ? mainAccentBorderClass : 'border-white/30'}
                              hover:bg-white/20 transition-all duration-200 text-center
                              ${idx === 1 ? `shadow-lg shadow-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]/30` : ''}`}
                  onClick={() => {
                    if (label === "Ride Now") {
                      setCurrentView('requestingRide');
                      if (!rideState.pickupLocation && !settingsLoading) performGeolocation();
                    } else {
                      handleStatusToast(`${label} Selected`, "This feature is coming soon!");
                    }
                  }}
                >
                  {idx === 0 && <History size={28} className={`mb-1 ${mainAccentTextClass}`} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} />}
                  {idx === 1 && <Bike size={32} className={`mb-1 ${mainAccentTextClass}`} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} />}
                  {idx === 2 && <CalendarCheck2 size={28} className={`mb-1 ${mainAccentTextClass}`} style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }} />}
                  <span className={`text-xs font-medium ${mainAccentTextClass}`} style={{ color: idx === 1 ? 'white' : PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }}>
                    {label.split(' ')[0]}
                  </span>
                   <span className={`text-xs font-medium ${mainAccentTextClass}`} style={{ color: idx === 1 ? 'white' : PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }}>
                    {label.split(' ')[1]}
                  </span>
                </Button>
              ))}
            </div>

            <div className="text-center text-white/70 text-sm flex items-center justify-center gap-1.5">
              Selected Payment: <CreditCard size={16} /> Apple Pay <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    );
  } else { // currentView === 'requestingRide'
    return (
      <>
      <style jsx global>{`
        :root {
          --input-card-height: ${rideState.status === 'idle' || rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' ? '150px' : '0px'};
          --status-card-height: ${rideState.status === 'confirmingRide' || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress' ? '230px' : '0px'};
          --ride-updates-card-height: ${rideUpdates.length > 0 ? '160px' : '0px'};
        }
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib-inner { display: none !important; }
      `}</style>
      <div className="bg-white text-black flex flex-col h-screen">
        <header className="p-4 flex justify-between items-center shadow-md sticky top-0 z-50" style={{ backgroundColor: PASSENGER_HEADER_BG, color: PASSENGER_HEADER_TEXT }}>
          <div className="flex items-center">
            <TriGoPassengerLogoInHeader />
            <h1 className="text-xl font-semibold" style={{ color: PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING }}>TriGo Passenger</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white"><Search size={20} /></Button>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white"><Globe size={20} /></Button>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white"><Grid size={20} /></Button>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white"><User size={20} /></Button>
          </div>
        </header>

        <div className="relative flex-grow">
          {MAPBOX_TOKEN && (
            <Map
              key={mapStyleUrl}
              ref={mapRef}
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              style={{ width: '100%', height: '100%' }}
              mapStyle={mapStyleUrl}
              mapboxAccessToken={MAPBOX_TOKEN}
              onClick={handleMapClick}
              attributionControl={false}
            >
              <NavigationControl position="top-right" />
              {rideState.pickupLocation && (
                <Marker longitude={rideState.pickupLocation.longitude} latitude={rideState.pickupLocation.latitude} anchor="bottom">
                  <MapPin size={36} className={`text-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`} fill="currentColor" />
                </Marker>
              )}
              {rideState.dropoffLocation && (
                <Marker longitude={rideState.dropoffLocation.longitude} latitude={rideState.dropoffLocation.latitude} anchor="bottom">
                  <MapPin size={36} className="text-red-500" fill="currentColor" />
                </Marker>
              )}
              {triderSimLocation && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
                <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude} anchor="bottom">
                  <div className={`p-1.5 rounded-full shadow-md bg-[${triderToPickupRouteColor}] text-white animate-pulse`}>
                    <Bike size={24} strokeWidth={2.5} />
                  </div>
                </Marker>
              )}
              {rideState.triderToPickupPath && rideState.status === 'triderAssigned' && (
                <Source id="route-trider-to-pickup" type="geojson" data={{ type: 'Feature', geometry: rideState.triderToPickupPath, properties: {} }}>
                  <Layer id="route-trider-to-pickup-layer" type="line" source="route-trider-to-pickup"
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                    paint={{ 'line-color': triderToPickupRouteColor, 'line-width': 6, 'line-opacity': 0.8 }}
                  />
                </Source>
              )}
              {rideState.pickupToDropoffPath && (rideState.status === 'confirmingRide' || rideState.status === 'inProgress') && (
                <Source id="route-pickup-to-dropoff" type="geojson" data={{ type: 'Feature', geometry: rideState.pickupToDropoffPath, properties: {} }}>
                  <Layer id="route-pickup-to-dropoff-layer" type="line" source="route-pickup-to-dropoff"
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                    paint={{ 'line-color': pickupToDropoffRouteColor, 'line-width': 6, 'line-opacity': 0.8 }}
                  />
                </Source>
              )}
            </Map>
          )}
           {!MAPBOX_TOKEN && (
              <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground">
                  Map preview unavailable: Mapbox token missing.
              </div>
           )}
        </div>

        <AnimatePresence>
          {rideUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "fixed left-1/2 transform -translate-x-1/2 z-20 w-[calc(100%-2rem)] sm:max-w-md",
                "bottom-[calc(var(--status-card-height,0px)_+_var(--input-card-height,0px)_+_2rem)] sm:bottom-[calc(var(--status-card-height,0px)_+_1rem)]"
              )}
            >
              <Card className={cn("p-0", PASSENGER_FLOATING_CARD_BG_DARK_GLASS, PASSENGER_FLOATING_CARD_BORDER_DARK_GLASS, `border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`)}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-semibold text-white/90 flex items-center"><History size={16} className="mr-2"/>Ride Updates</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 max-h-[100px] overflow-y-auto">
                  <ul className="space-y-1.5">
                    {rideUpdates.map((update, index) => (
                      <li key={index} className={`text-xs ${index === 0 ? 'text-white/90' : 'text-white/60'} border-b border-white/20 dark:border-slate-700/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0`}>
                        {update}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(rideState.status === 'confirmingRide' || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "fixed left-1/2 transform -translate-x-1/2 z-20 w-[calc(100%-2rem)] sm:max-w-md",
                 rideUpdates.length > 0 
                  ? "bottom-[calc(var(--ride-updates-card-height,0px)_+_var(--input-card-height,0px)_-_8rem)] sm:bottom-[calc(var(--input-card-height,0px)_+_1rem)]" 
                  : "bottom-[calc(var(--input-card-height,0px)_+_1rem)]"
              )}
            >
              <Alert className={cn("relative", PASSENGER_FLOATING_CARD_BG_DARK_GLASS, `border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`, PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS)}>
                 <div className="flex items-center justify-between mb-2">
                  <AlertTitle className="text-lg font-semibold text-white">
                    {rideState.status === 'confirmingRide' && "Confirm Your Ride"}
                    {rideState.status === 'searching' && "Searching for TriDer..."}
                    {rideState.status === 'triderAssigned' && "TriDer En Route!"}
                    {rideState.status === 'inProgress' && "Ride In Progress"}
                  </AlertTitle>
                  {rideState.currentRideId && (
                    <div className="text-xs text-white/70 flex items-center">
                      <Ticket size={14} className="mr-1" />
                      Ride Ticket #{rideState.currentRideId.slice(-6)}
                    </div>
                  )}
                </div>

                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                  <div className="mb-3 text-sm text-white/80">
                    <p>Trider: {rideState.assignedTrider.name} (#{rideState.assignedTrider.bodyNumber}) - {rideState.assignedTrider.vehicleType}</p>
                  </div>
                )}
                
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.countdownSeconds !== null && (
                  <div className="text-center my-3">
                    <p className="text-sm text-white/70 mb-1">
                      {rideState.status === 'triderAssigned' ? "ETA to Pickup:" : "ETA to Destination:"}
                    </p>
                    <p className={`text-6xl font-mono ${NEON_GREEN_TEXT_TIMER} ${countdownPulseClass}`} style={countdownColorStyle}>
                      {formatCountdown(rideState.countdownSeconds)}
                    </p>
                  </div>
                )}

                {currentPathForProgress && (rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
                    <Progress value={progressValue} className={cn("w-full h-1.5 my-3 bg-muted-foreground/30", `[&>div]:bg-[${NEON_GREEN_TEXT_TIMER}]`)} />
                )}
                
                {rideState.status === 'searching' && (
                  <div className="flex justify-center my-4">
                    <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
                  </div>
                )}

                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                  <div className="text-xs text-white/70 mt-2">
                    <p>From: {rideState.pickupAddress}</p>
                    <p>To: {rideState.dropoffAddress}</p>
                  </div>
                )}
                
                {rideState.status === 'confirmingRide' && (
                  <div className="text-sm text-white/80 space-y-1 mb-4">
                    <p>From: {rideState.pickupAddress}</p>
                    <p>To: {rideState.dropoffAddress}</p>
                    <p>Est. Fare: ₱{rideState.estimatedFare?.toFixed(2) ?? 'Calculating...'}</p>
                  </div>
                )}

                {rideState.status === 'confirmingRide' && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancelRide} className="flex-1 bg-transparent text-white/80 border-white/50 hover:bg-white/10 hover:text-white">Cancel</Button>
                    <NeonTrikeCtaButton
                      onClick={handleConfirmRide}
                      disabled={rideState.status !== 'confirmingRide' || !rideState.pickupLocation || !rideState.dropoffLocation}
                      className="w-20 h-20" 
                    />
                  </div>
                )}

                {rideState.status === 'inProgress' && (
                  <div className="mt-3">
                     <Button variant="ghost" size="sm" onClick={handleShareRide} className="w-full text-white/80 hover:text-white hover:bg-white/10">
                        <Share2 className="mr-2 h-4 w-4" /> Share Ride Progress
                    </Button>
                  </div>
                )}
                 {(rideState.status === 'triderAssigned' || rideState.status === 'searching') && (
                  <Button variant="destructive" onClick={handleCancelRide} className="w-full mt-3 text-sm">Cancel Search</Button>
                )}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-md z-10",
                PASSENGER_FLOATING_CARD_BG_DARK_GLASS, 
                PASSENGER_FLOATING_CARD_BORDER_DARK_GLASS, 
                "rounded-t-xl sm:rounded-xl", 
                PASSENGER_FLOATING_CARD_SHADOW_DARK_GLASS
              )}
            >
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-3 space-y-3">
                  <div className="relative">
                    <Label htmlFor="pickup-location" className="text-white/90">Pickup Location</Label>
                    <div className="relative mt-1">
                      <Input
                        id="pickup-location"
                        placeholder="Search or click map for pickup..."
                        value={pickupInput}
                        onChange={e => { setPickupInput(e.target.value); handleAddressSearch('pickup', e.target.value); }}
                        onFocus={() => setActiveSuggestionBox('pickup')}
                        className={`bg-white/10 ${PASSENGER_INPUT_TEXT_COLOR} ${PASSENGER_PLACEHOLDER_TEXT_COLOR} border-slate-700/70 focus:border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}] focus:ring-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}] pr-10`}
                        disabled={rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff'}
                      />
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => performGeolocation(true)} 
                         disabled={isGeolocating}
                         className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                         aria-label="Use current location for pickup"
                       >
                         {isGeolocating && rideState.status === 'selectingPickup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                       </Button>
                    </div>
                    {activeSuggestionBox === 'pickup' && pickupSuggestions.length > 0 && (
                      <Card className={`absolute bottom-full left-0 right-0 mb-1 z-30 max-h-48 overflow-y-auto ${PASSENGER_FLOATING_CARD_BG_DARK_GLASS} border-slate-700/70`}>
                        <CardContent className="p-1">
                          {pickupSuggestions.map(s => (
                            <button key={s.id} onClick={() => handleSelectSuggestion('pickup', s)} className={`block w-full text-left p-2 text-sm rounded-md hover:bg-white/20 ${PASSENGER_INPUT_TEXT_COLOR}`}>
                              {s.place_name}
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="relative">
                    <Label htmlFor="dropoff-location" className="text-white/90">Dropoff Location</Label>
                     <div className="relative mt-1">
                        <Input
                            id="dropoff-location"
                            placeholder="Search or click map for dropoff..."
                            value={dropoffInput}
                            onChange={e => { setDropoffInput(e.target.value); handleAddressSearch('dropoff', e.target.value); }}
                            onFocus={() => setActiveSuggestionBox('dropoff')}
                            className={`bg-white/10 ${PASSENGER_INPUT_TEXT_COLOR} ${PASSENGER_PLACEHOLDER_TEXT_COLOR} border-slate-700/70 focus:border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}] focus:ring-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]`}
                            disabled={!rideState.pickupLocation || (rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide')}
                        />
                      </div>
                    {activeSuggestionBox === 'dropoff' && dropoffSuggestions.length > 0 && (
                       <Card className={`absolute bottom-full left-0 right-0 mb-1 z-30 max-h-48 overflow-y-auto ${PASSENGER_FLOATING_CARD_BG_DARK_GLASS} border-slate-700/70`}>
                        <CardContent className="p-1">
                          {dropoffSuggestions.map(s => (
                            <button key={s.id} onClick={() => handleSelectSuggestion('dropoff', s)} className={`block w-full text-left p-2 text-sm rounded-md hover:bg-white/20 ${PASSENGER_INPUT_TEXT_COLOR}`}>
                              {s.place_name}
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                
                  {rideState.status === 'selectingDropoff' && (
                     <div className="mt-4 flex justify-center">
                      <NeonTrikeCtaButton
                        onClick={handlePickMeUpNow}
                        disabled={!rideState.pickupLocation || isGeolocating || isSearchingAddress}
                        isLoading={rideState.status === 'selectingDropoff' && !rideState.estimatedFare} // Example loading state
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Accordion */}
        <div className={cn(
          "fixed top-20 right-4 z-30 w-full max-w-xs",
          currentView === 'requestingRide' && "hidden" // Hide settings on landing view
        )}>
          <Accordion type="single" collapsible className={cn(PASSENGER_FLOATING_CARD_BG_DARK_GLASS, `border border-[${PASSENGER_PAGE_ACCENT_COLOR_HSL_STRING}]/70`, "rounded-lg shadow-lg")}>
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className={`px-4 py-3 text-sm font-medium text-white/90 hover:no-underline hover:bg-white/5 rounded-t-lg [&[data-state=open]]:rounded-b-none`}>
                <div className="flex items-center">
                  <SettingsIconLucide className="mr-2 h-4 w-4" /> My Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 bg-black/10 rounded-b-lg">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="map-style-select" className="text-xs text-white/80">Map Style</Label>
                    <Select
                      value={currentPassengerSettings?.mapStyle || DEFAULT_PASSENGER_MAP_STYLE}
                      onValueChange={(value) => setCurrentPassengerSettings(prev => ({...prev, mapStyle: value as PassengerMapStyle}))}
                    >
                      <SelectTrigger id="map-style-select" className={`mt-1 w-full bg-transparent text-black border-neutral-400 text-sm text-white/90 data-[placeholder]:text-white/60`}>
                        <SelectValue placeholder="Select map style" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 text-white border-slate-700">
                        <SelectItem value="streets" className="hover:bg-slate-700 focus:bg-slate-700">Streets</SelectItem>
                        <SelectItem value="satellite" className="hover:bg-slate-700 focus:bg-slate-700">Satellite</SelectItem>
                        <SelectItem value="dark" className="hover:bg-slate-700 focus:bg-slate-700">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSavePassengerSettings} size="sm" className={`w-full ${mainButtonColorClass}`}>Save My Settings</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {isChatVisible && (
          <AdminChatManager
            supabase={null}
            adminUser={null}
          />
        )}

      </div>
      {completedRideDetails && (
        <RideReceiptDialog
          isOpen={isReceiptDialogOpen}
          onOpenChange={(isOpen) => {
            setIsReceiptDialogOpen(isOpen);
            if (!isOpen) setCompletedRideDetails(null);
          }}
          rideDetails={completedRideDetails}
        />
      )}
    </>
    );
  }
}
