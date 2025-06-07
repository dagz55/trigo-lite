"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar'; // Import the new component
import { RideReceiptDialog } from '@/components/passenger/RideReceiptDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppleSlider } from "@/components/ui/apple-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PickMeUpNowButton from "@/components/ui/PickMeUpIcon";
import PyramidLoader from '@/components/ui/PyramidLoader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";
import { useUser } from "@/contexts/UserContext";
import { todaZones as appTodaZones } from "@/data/todaZones";
import { useToast } from "@/hooks/use-toast";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { calculateDistance, getRandomPointInCircle, isPointInCircle } from "@/lib/geoUtils";
import { formatCurrency, getPaymentIcon } from "@/lib/paymentUtils";
import { cn } from "@/lib/utils";
import type {
  Coordinates,
  MockPassengerProfile,
  PassengerMapStyle,
  PassengerRideState,
  PassengerSettings,
  PaymentMethod,
  RoutePath,
  TodaZone,
  TriderProfile
} from "@/types";
import {
  Bike,
  CalendarCheck2,
  ChevronDown,
  CreditCard,
  Crosshair,
  History,
  Loader2,
  LogIn as LogInIcon,
  MapPin,
  Search,
  SettingsIcon as SettingsIconLucide,
  Ticket,
  XCircle
} from 'lucide-react';
import * as React from 'react'; // Ensure React is imported for useState/useRef
import Map, { Layer, MapRef, Marker, NavigationControl, Source } from 'react-map-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2';

const PASSENGER_PAGE_ACCENT_COLOR_HSL = 'hsl(262, 78%, 59%)'; // Purple
const PASSENGER_HEADER_BG = 'black';
const PASSENGER_HEADER_TEXT = 'white';
const PASSENGER_INPUT_TEXT_COLOR = 'text-neutral-100';
const PASSENGER_PLACEHOLDER_TEXT_COLOR = 'placeholder:text-neutral-400';
const PASSENGER_PAGE_OVERLAY_BG = 'bg-black/50';

const DEFAULT_PASSENGER_MAP_STYLE: PassengerMapStyle = 'standard';

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

import { AlertCircle } from 'lucide-react'; // Import AlertCircle icon

const TriGoPassengerLogoInHeader = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
    <circle cx="16" cy="16" r="13" stroke={PASSENGER_PAGE_ACCENT_COLOR_HSL} strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none"/>
    <path d="M M9.5 12 Q16 8 22.5 12 L19.5 12" stroke={PASSENGER_HEADER_TEXT} strokeWidth="1.2" fill="none" />
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
    convenienceFee,
    perKmCharge,
    getTodaTerminalExitPoint
  } = useSettings();
  const { defaultPaymentMethod, paymentMethods, setDefaultPaymentMethod } = useUser();
  const { toast } = useToast();
  const { paymentState, processPaymentMethod, resetPaymentState, isProcessing } = usePaymentProcessing();

  const [currentView, setCurrentView] = React.useState<'landing' | 'requestingRide'>('landing');

  const [loadedPassengerProfile, setLoadedPassengerProfile] = React.useState<MockPassengerProfile | null>(null);
  const [currentPassengerSettings, setCurrentPassengerSettings] = React.useState<PassengerSettings>({
    mapStyle: DEFAULT_PASSENGER_MAP_STYLE,
    notifications: true,
    soundEnabled: true,
    vibrationEnabled: true
  });

  // TriGo Animation Settings
  const [animationSpeed, setAnimationSpeed] = React.useState([100]); // 100% speed
  const [enableAnimations, setEnableAnimations] = React.useState(true);
  const [enableSoundEffects, setEnableSoundEffects] = React.useState(true);
  const [enableHapticFeedback, setEnableHapticFeedback] = React.useState(true);

  // Update CSS animation speed when slider changes
  React.useEffect(() => {
    const speedMultiplier = animationSpeed[0] / 100;
    document.documentElement.style.setProperty('--animation-speed-multiplier', speedMultiplier.toString());
  }, [animationSpeed]);
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
  });
  const [rideUpdates, setRideUpdates] = React.useState<string[]>([]); // New state for updates

  const [searchPercentage, setSearchPercentage] = React.useState(0);

  const [triderSimLocation, setTriderSimLocation] = React.useState<Coordinates | null>(null);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = React.useState(false);

  const [pickupInput, setPickupInput] = React.useState('');
  const [dropoffInput, setDropoffInput] = React.useState('');
  const [pickupSuggestions, setPickupSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = React.useState<MapboxGeocodingFeature[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = React.useState<'pickup' | 'dropoff' | null>(null);

  const [triderToPickupRouteColor, setTriderToPickupRouteColor] = React.useState('hsl(90, 90%, 50%)');
  const [pickupToDropoffRouteColor, setPickupToDropoffRouteColor] = React.useState(PASSENGER_PAGE_ACCENT_COLOR_HSL);

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
  const [completedRideDetails, setCompletedRideDetails] = React.useState<PassengerRideState | null>(null);

  // Simulated state for premium status and daily emergency alerts
  const [isPremium, setIsPremium] = React.useState(true); // Assume premium for demo
  const [dailyAlertCount, setDailyAlertCount] = React.useState(0);
  const MAX_DAILY_ALERTS = 12;

  const mapRef = React.useRef<MapRef | null>(null);

   const addRideUpdate = React.useCallback((update: string) => {
    setRideUpdates(prev => [update, ...prev]); // Add new updates to the top
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
        setPickupToDropoffRouteColor(PASSENGER_PAGE_ACCENT_COLOR_HSL);
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

  const resetRideState = React.useCallback(() => {
    setCurrentView('landing');
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
    });
    setRideUpdates([]); // Reset updates
    setPickupInput('');
    setDropoffInput('');
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setTriderSimLocation(null);
    setActiveSuggestionBox(null);
    setIsGeolocating(false);
    setIsSearchingAddress(false);
    toastShownForStatus.current = {};
  }, [loadedPassengerProfile]);

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
        if (showToastFeedback) handleStatusToast("Route Not Found", "Could not calculate route for the selected points.", "destructive");
      }
    } catch (error) {
      console.error("Error fetching route for passenger map:", error);
      setRideState(prev => ({ ...prev, triderToPickupPath: null, pickupToDropoffPath: null, estimatedDurationSeconds: null, countdownSeconds: null }));
      if (showToastFeedback) handleStatusToast("Route Error", "Failed to fetch route information.", "destructive");
    }
    return null;
  }, [MAPBOX_TOKEN, handleStatusToast]);

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
            if (newDropoffLocation && coords && !settingsLoading) { // check coords is not null
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
  }, [getTodaZoneForLocation, handleStatusToast, getTodaTerminalExitPoint, calculateEstimatedFare, fetchRoute, settingsLoading]);

  React.useEffect(() => {
    let storedProfile = null;
    try {
      storedProfile = localStorage.getItem('selectedPassengerProfile');
      if (storedProfile) {
        const passenger: MockPassengerProfile = JSON.parse(storedProfile);
        setLoadedPassengerProfile(passenger);
        setRideState(prev => ({ ...prev, passengerName: passenger.name, status: 'idle' }));

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
        localStorage.removeItem('selectedPassengerProfile');
      } else if (currentView === 'requestingRide' && !settingsLoading) {
        performGeolocation();
      }
    } catch (error) {
      console.error("Error loading passenger profile/settings from localStorage:", error);
      if (currentView === 'requestingRide' && !settingsLoading) performGeolocation();
    }
  }, [currentView, performGeolocation, settingsLoading]);

  React.useEffect(() => {
    switch (currentPassengerSettings.mapStyle) {
      case 'satellite':
        setMapStyleUrl('mapbox://styles/mapbox/satellite-streets-v12');
        break;
      case 'dark':
        setMapStyleUrl('mapbox://styles/mapbox/dark-v11');
        break;
      case 'standard':
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
            if (prevLoc.longitude !== targetLocation.longitude || prevLoc.latitude !== targetLocation.latitude) {
                setRideState(prevRideState => ({ ...prevRideState, countdownSeconds: 0 }));
                return targetLocation;
            }
            setRideState(prevRideState => ({ ...prevRideState, countdownSeconds: 0 }));
            return prevLoc;
        }

        let nextIndex = rideState.currentTriderPathIndex + 1;
        const newCoords: Coordinates = {
          longitude: currentPath.coordinates[nextIndex][0],
          latitude: currentPath.coordinates[nextIndex][1],
        };
        setRideState(prevRideState => ({ ...prevRideState, currentTriderPathIndex: nextIndex }));
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
    rideState.dropoffLocation
  ]);

  const prevRideStatusRef = React.useRef<PassengerRideState['status']>();
  React.useEffect(() => {
    const currentStatus = rideState.status;
    const prevStatus = prevRideStatusRef.current;
    const rideId = rideState.currentRideId || 'ride';

    if (prevStatus === currentStatus) return;

    const showToastForStatus = (statusKey: string, title: string, description: string) => {
      const toastKey = `${statusKey}-${rideId}`;
      if (!toastShownForStatus.current[toastKey]) {
        handleStatusToast(title, description);
        toastShownForStatus.current[toastKey] = true;
      }
    };

    if (currentStatus === 'inProgress' && prevStatus === 'triderAssigned') {
        showToastForStatus('arrived-pickup', "Trider Arrived for Pickup!", `${rideState.assignedTrider?.name || 'Your trider'} is here. Heading to destination.`);
        addRideUpdate(`TriDer ${rideState.assignedTrider?.name || ''} arrived at your pickup location.`);
    } else if (currentStatus === 'completed' && prevStatus === 'inProgress') {
        showToastForStatus('completed', "Ride Completed!", `You've arrived. Thank you for using TriGo, ${rideState.passengerName || 'Passenger'}!`);
        addRideUpdate("Ride completed. Thank you for using TriGo!");
    }
    prevRideStatusRef.current = currentStatus;
  }, [rideState.status, rideState.currentRideId, rideState.assignedTrider, rideState.passengerName, handleStatusToast]);


  React.useEffect(() => {
    const currentStatus = rideState.status;
    const pathToCheck = currentStatus === 'triderAssigned' ? rideState.triderToPickupPath : rideState.pickupToDropoffPath;
    const atDestinationOfSegment = pathToCheck && rideState.currentTriderPathIndex !== undefined && rideState.currentTriderPathIndex >= pathToCheck.coordinates.length - 1;

    if (currentStatus === 'triderAssigned' && atDestinationOfSegment) {
        setRideState(prev => ({ ...prev, countdownSeconds: 0 }));
         addRideUpdate("TriDer arrived at pickup location.");
        if (rideState.dropoffLocation && rideState.pickupLocation) {
            setRideState(prev => ({ ...prev, status: 'inProgress', currentTriderPathIndex: 0, triderToPickupPath: null }));
            fetchRoute(rideState.pickupLocation, rideState.dropoffLocation, 'pickupToDropoff', true);
        }
    } else if (currentStatus === 'inProgress' && atDestinationOfSegment) {
        setRideState(prev => ({ ...prev, countdownSeconds: 0 }));
         addRideUpdate("Arrived at dropoff location.");
        const now = new Date();
        const finalRideState: PassengerRideState = {...rideState, status: 'completed' as const, pickupToDropoffPath: null, completionTime: now};
        setRideState(finalRideState);
        setCompletedRideDetails(finalRideState);
        console.log("Simulating: Ride completed. Receipt data to save:", finalRideState);
        setIsReceiptDialogOpen(true);
    }
  }, [rideState.status, rideState.currentTriderPathIndex, rideState.triderToPickupPath, rideState.pickupToDropoffPath, rideState.pickupLocation, rideState.dropoffLocation, fetchRoute]);


  const getRouteDuration = React.useCallback(async (start: Coordinates, end: Coordinates): Promise<number | null> => {
    if (!MAPBOX_TOKEN) return null;
    const coordinatesString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?overview=simplified&alternatives=true&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
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
                return {
                  ...prev,
                 // estimatedDurationSeconds: newDuration, // Keep the initial estimate unless a major reroute happens
                  countdownSeconds: newDuration,
                }
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
  }, [getTodaZoneForLocation, handleStatusToast, calculateEstimatedFare, fetchRoute, rideState.pickupLocation, rideState.dropoffLocation, rideState.pickupTodaZoneId, getTodaTerminalExitPoint, settingsLoading]);


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
      const fare = calculateEstimatedFare(rideState.pickupLocation!, newLocation, rideState.pickupTodaZoneId);
      setRideState(prev => ({ ...prev, dropoffLocation: newLocation, dropoffAddress: newAddress, estimatedFare: fare }));
      setDropoffInput(newAddress);
      setDropoffSuggestions([]);
       addRideUpdate(`Dropoff location updated by map click: ${newAddress}`);
       if(rideState.pickupLocation) fetchRoute(rideState.pickupLocation, newLocation, 'confirmation', false);
      handleStatusToast("Dropoff Updated by Map Click", "Confirm your ride details.");
    }
  }, [isSearchingAddress, rideState.status, rideState.pickupLocation, rideState.dropoffLocation, getTodaZoneForLocation, handleStatusToast, calculateEstimatedFare, fetchRoute, getTodaTerminalExitPoint, rideState.pickupTodaZoneId, settingsLoading]);

  const handlePickMeUpNow = React.useCallback(async () => {
     if (rideState.status === 'confirmingRide' && rideState.pickupLocation && rideState.dropoffLocation && rideState.estimatedFare !== null && rideState.pickupTodaZoneId) {
         toastShownForStatus.current = {}; // Reset toasts for new ride
         const newRideId = `TKT-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
         setRideState(prev => ({ ...prev, status: 'searching', assignedTrider: null, currentRideId: newRideId }));
         handleStatusToast("Searching for TriDer...", "Looking for available triders near your pickup location.");
         addRideUpdate(`Ride request sent. Searching for TriDer (Ticket ID: ${newRideId})...`);
         console.log("Simulating: Searching for trider with request:", {
             passengerName: rideState.passengerName,
             pickupLocation: rideState.pickupLocation,
             dropoffLocation: rideState.dropoffLocation,
             estimatedFare: rideState.estimatedFare,
             pickupTodaZoneId: rideState.pickupTodaZoneId
         });

         setSearchPercentage(0); // Reset percentage
         const searchInterval = setInterval(() => {
           setSearchPercentage(prev => {
             const newPercentage = prev + 5; // Increment by 5%
             if (newPercentage >= 100) {
               clearInterval(searchInterval);
               return 100;
             }
             return newPercentage;
           });
         }, 150); // Update percentage every 150ms for 3s total (3000ms / 150ms = 20 steps * 5% = 100%)

         setTimeout(async () => {
             clearInterval(searchInterval); // Ensure interval is cleared
             const assignedTrider = mockTridersForDemo[Math.floor(Math.random() * mockTridersForDemo.length)];
             const rideId = rideState.currentRideId || `ride-${Date.now()}`;
             setTriderSimLocation(assignedTrider.location); // Initialize trider location
             await fetchRoute(assignedTrider.location, rideState.pickupLocation!, 'triderToPickup');

             handleStatusToast("TriDer Assigned!", `TriDer ${assignedTrider.name} is on their way.`);
             addRideUpdate(`TriDer ${assignedTrider.name} (${assignedTrider.bodyNumber}) assigned. En route to pickup.`);
             setRideState(prev => ({ ...prev, status: 'triderAssigned', assignedTrider, currentTriderPathIndex: 0, completionTime: undefined }));
             setSearchPercentage(100); // Ensure it ends at 100%
         }, 3000);
     }
  }, [rideState, fetchRoute, handleStatusToast, addRideUpdate]);

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

    const pickupZone = appTodaZones.find(z => z.id === rideState.pickupTodaZoneId);
    const terminal = pickupZone ? getTodaTerminalExitPoint(pickupZone.id) : undefined;

    let simulatedDropoff: Coordinates;
    let simulatedDropoffAddress: string;

    if (terminal && terminal.point && terminal.address) {
        simulatedDropoff = terminal.point;
        simulatedDropoffAddress = terminal.address;
    } else if (pickupZone) {
        simulatedDropoff = getRandomPointInCircle(pickupZone.center, pickupZone.radiusKm * 0.5);
        simulatedDropoffAddress = `${pickupZone.name} area (simulated dropoff)`;
    } else {
        handleStatusToast("Cannot Simulate Dropoff", "Pickup zone information is missing.", "destructive");
        return;
    }

    if(rideState.pickupLocation && !settingsLoading){
        const fare = calculateEstimatedFare(rideState.pickupLocation, simulatedDropoff, rideState.pickupTodaZoneId);
        await fetchRoute(rideState.pickupLocation, simulatedDropoff, 'confirmation', false);
        setRideState(prev => ({
            ...prev,
            dropoffLocation: simulatedDropoff,
            dropoffAddress: simulatedDropoffAddress,
            estimatedFare: fare,
            status: 'confirmingRide',
            currentRideId: `TKT-${Date.now()}-${Math.random().toString(16).slice(2,6)}`
        }));
        setDropoffInput(simulatedDropoffAddress);
       addRideUpdate(`Simulated dropoff location set: ${simulatedDropoffAddress}`);
       handleStatusToast("Simulated Dropoff Set", "Review details and confirm.");
    }

  }, [rideState.pickupLocation, rideState.pickupTodaZoneId, rideState.dropoffLocation, calculateEstimatedFare, fetchRoute, handleStatusToast, getTodaTerminalExitPoint, settingsLoading]);

  const handleEmergencyAlert = React.useCallback(() => {
    if (!isPremium) {
      handleStatusToast("Premium Feature", "Emergency alerts are available for premium subscribers only.", "destructive");
      return;
    }
    if (dailyAlertCount >= MAX_DAILY_ALERTS) {
      handleStatusToast("Daily Limit Reached", `You have reached your daily limit of ${MAX_DAILY_ALERTS} emergency alerts.`, "destructive");
      return;
    }

    // Simulate sending alert and making calls
    console.log("EMERGENCY ALERT TRIGGERED!");
    console.log("Simulating: Sending SOS alert to dispatchers, triders, family/friends...");
    console.log("Simulating: Calling nearest police station, family members, friends...");

    setDailyAlertCount(prev => prev + 1);
    handleStatusToast("Emergency Alert Sent", `SOS alert triggered. Help is on the way. (${dailyAlertCount + 1}/${MAX_DAILY_ALERTS} today)`);
    addRideUpdate(`EMERGENCY ALERT: SOS triggered. Alert count: ${dailyAlertCount + 1}/${MAX_DAILY_ALERTS}`);

    // In a real app, this would involve API calls, push notifications, etc.
  }, [isPremium, dailyAlertCount, handleStatusToast, addRideUpdate]);

  // New button handlers
  const handleMenuClick = React.useCallback(() => {
    handleStatusToast("Menu", "Menu functionality coming soon! This will show navigation options, settings, and account management.");
  }, [handleStatusToast]);

  const handleSearchClick = React.useCallback(() => {
    if (currentView === 'landing') {
      setCurrentView('requestingRide');
      handleStatusToast("Search Mode", "Switched to ride booking mode. You can now search for pickup and dropoff locations.");
    } else {
      handleStatusToast("Search", "Use the pickup and dropoff fields below to search for locations.");
    }
  }, [currentView, handleStatusToast]);

  const handleMapStyleToggle = React.useCallback(() => {
    const styles: Array<PassengerMapStyle> = ['standard', 'satellite', 'dark'];
    const currentIndex = styles.indexOf(currentPassengerSettings.mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const nextStyle = styles[nextIndex];

    setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: nextStyle }));

    const styleNames = {
      'standard': 'Standard',
      'satellite': 'Satellite',
      'dark': 'Dark'
    };

    handleStatusToast("Map Style Changed", `Switched to ${styleNames[nextStyle]} view`);
  }, [currentPassengerSettings.mapStyle, handleStatusToast]);

  const handleLoginLogout = React.useCallback(() => {
    // For demo purposes, we'll simulate login/logout
    const isLoggedIn = loadedPassengerProfile !== null;

    if (isLoggedIn) {
      // Simulate logout
      setLoadedPassengerProfile(null);
      localStorage.removeItem("selectedPassengerProfile");
      handleStatusToast("Logged Out", "You have been logged out successfully.");
    } else {
      // Simulate login - redirect to sign-in page
      window.open('/sign-in', '_blank');
      handleStatusToast("Login", "Opening login page in new tab...");
    }
  }, [loadedPassengerProfile, handleStatusToast]);

  const handlePaymentMethodSelect = React.useCallback((methodId: string) => {
    setDefaultPaymentMethod(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      toast({
        title: "Payment Method Updated",
        description: `${method.name} is now your default payment method.`,
      });
    }
  }, [setDefaultPaymentMethod, paymentMethods, toast]);

  // Payment processing handler for testing payment methods
  const handleTestPayment = React.useCallback(async (paymentMethod: PaymentMethod) => {
    if (isProcessing) return;

    // Test payment amount (₱50 for demo)
    const testAmount = 50;

    try {
      const transaction = await processPaymentMethod(testAmount, paymentMethod);
      if (transaction) {
        // Payment successful - transaction details are handled by the hook
        console.log('Payment successful:', transaction);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  }, [processPaymentMethod, isProcessing]);

  const handleRideBefore = React.useCallback(() => {
    handleStatusToast("Ride Before", "Schedule future rides! This feature allows you to book rides in advance. Coming soon!");
  }, [handleStatusToast]);

  const handleRideLater = React.useCallback(() => {
    handleStatusToast("Ride Later", "Schedule rides for later today! This feature allows you to set a specific time for pickup. Coming soon!");
  }, [handleStatusToast]);


  const mainButtonColorClass = `bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL}] hover:bg-[${PASSENGER_PAGE_ACCENT_COLOR_HSL}]/90`;
  const countdownColorStyle = { color: PASSENGER_HEADER_TEXT }; // White
  const countdownPulseClass = rideState.countdownSeconds !== null && rideState.countdownSeconds <= 10 ? 'font-bold animate-pulse' : 'font-bold';


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
      <div className="relative flex flex-col h-screen bg-cover bg-center text-white"
           style={{
             backgroundImage: "url('/images/traffic_blur.png')",
             backgroundPosition: 'center',
             backgroundSize: 'cover'
           }}
           data-ai-hint="street traffic blur">
        <div className={cn("absolute inset-0", PASSENGER_PAGE_OVERLAY_BG, "z-0")}></div>

        <div className="relative z-10 flex flex-col h-full p-6 pt-4">
          <header className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* TriGo Logo */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Emergency Button */}
              <Button variant="ghost" size="icon" className="text-red-400 hover:bg-white/20 hover:text-red-300 border-2 border-red-400/40 hover:border-red-300/60 rounded-lg transition-all duration-200" title="Emergency SOS" onClick={handleEmergencyAlert}>
                <AlertCircle size={20} />
              </Button>

              {/* Search Button */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 border-2 border-white/40 hover:border-white/60 rounded-lg transition-all duration-200" title="Search" onClick={handleSearchClick}>
                <Search size={20} />
              </Button>

              {/* Settings Button */}
              <Accordion type="single" collapsible className="w-auto text-white">
                <AccordionItem value="settings" className="border-b-0">
                  <AccordionTrigger className="p-2.5 hover:no-underline hover:bg-white/20 rounded-lg border-2 border-white/40 hover:border-white/60 transition-all duration-200" title="TriGo Settings">
                    <SettingsIconLucide size={22} />
                  </AccordionTrigger>
                  <AccordionContent className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md text-black rounded-xl shadow-2xl p-6 z-20 border border-amber-200">
                    <h3 className="text-xl font-bold mb-4 text-neutral-800 flex items-center">
                      <SettingsIconLucide size={20} className="mr-2 text-amber-600" />
                      TriGo Settings
                    </h3>
                    <div className="space-y-6">
                      {/* Animation Speed */}
                      <div>
                        <AppleSlider
                          label="Animation Speed"
                          value={animationSpeed}
                          onValueChange={setAnimationSpeed}
                          min={25}
                          max={200}
                          step={25}
                          unit="%"
                          showValue={true}
                        />
                      </div>

                      {/* Map Style */}
                      <div>
                        <Label htmlFor="mapStyle" className="text-neutral-700 font-medium">Map Style</Label>
                        <Select value={currentPassengerSettings.mapStyle} onValueChange={(value: PassengerMapStyle) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value }))}>
                          <SelectTrigger id="mapStyle" className="mt-2 bg-white/80 text-black border-amber-300 focus:border-amber-500">
                            <SelectValue placeholder="Select map style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Streets</SelectItem>
                            <SelectItem value="satellite">Satellite</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Enable Animations */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableAnimations" className="text-neutral-700 font-medium">Enable Animations</Label>
                        <Switch
                          id="enableAnimations"
                          checked={enableAnimations}
                          onCheckedChange={setEnableAnimations}
                        />
                      </div>

                      {/* Sound Effects */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableSoundEffects" className="text-neutral-700 font-medium">Sound Effects</Label>
                        <Switch
                          id="enableSoundEffects"
                          checked={enableSoundEffects}
                          onCheckedChange={setEnableSoundEffects}
                        />
                      </div>

                      {/* Haptic Feedback */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableHapticFeedback" className="text-neutral-700 font-medium">Haptic Feedback</Label>
                        <Switch
                          id="enableHapticFeedback"
                          checked={enableHapticFeedback}
                          onCheckedChange={setEnableHapticFeedback}
                        />
                      </div>

                      <Button onClick={handleSavePassengerSettings} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200">
                        Save Settings
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Login/Logout Button */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 border-2 border-white/40 hover:border-white/60 rounded-lg transition-all duration-200" title="Login/Logout" onClick={handleLoginLogout}>
                <LogInIcon size={20} />
              </Button>
            </div>
          </header>

          <div className="flex-grow flex flex-col items-center justify-center text-center -mt-12 sm:-mt-16">
            <h1 className="text-7xl sm:text-8xl font-bold mb-2" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL}}>
              TriGo
            </h1>
            <p className="text-xl sm:text-2xl text-white/80">
              Hello, {rideState.passengerName || "Michelle"}!
            </p>
          </div>

          <div className="pb-4 relative">
            {/* Dotted Background Lights */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="dotted-light"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s, ${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 sm:mb-8 max-w-xs sm:max-w-sm mx-auto relative z-10">
              {[{ label: "Ride", subLabel: "Before", icon: History, action: handleRideBefore },
               { label: "Ride", subLabel: "Now", icon: Bike, action: () => { setCurrentView('requestingRide'); if(!settingsLoading && !rideState.pickupLocation) { performGeolocation(); } } },
               { label: "Ride", subLabel: "Later", icon: CalendarCheck2, action: handleRideLater }
              ].map((item, idx) => (
                <Button
                  key={item.subLabel}
                  variant="outline"
                  className="glass-crystal-effect flex flex-col items-center justify-center h-24 w-24 rounded-full p-0 border-2 transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 active:scale-95 overflow-hidden"
                  style={{
                      borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL,
                      color: PASSENGER_PAGE_ACCENT_COLOR_HSL,
                  }}
                  onClick={item.action}
                  title={`${item.label} ${item.subLabel}`} // Add tooltip here
                >
                  <item.icon size={20} className="mb-1 relative z-10"/>
                  <span className="text-sm font-medium relative z-10">{item.label}</span>
                  <span className="text-xs relative z-10">{item.subLabel}</span>
                </Button>
              ))}
            </div>
            <footer className="text-center text-sm text-white/70">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center hover:text-white/90 transition-colors cursor-pointer"
                    title="Select Payment Method"
                  >
                    Selected Payment:
                    {defaultPaymentMethod ? (
                      <>
                        <span className="mx-1.5">{getPaymentIcon(defaultPaymentMethod)}</span>
                        {defaultPaymentMethod.name}
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} className="mx-1.5" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL}}/>
                        No Payment Method
                      </>
                    )}
                    <ChevronDown size={16} className="ml-1" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL}} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-64 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-lg"
                >
                  {paymentMethods.map((method) => (
                    <DropdownMenuItem
                      key={method.id}
                      className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-white/50 transition-colors ${
                        method.isDefault ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div
                        className="payment-icon cursor-pointer hover:scale-110 transition-transform duration-200"
                        onClick={() => handleTestPayment(method)}
                        title={`Test ${method.name} payment (₱50)`}
                      >
                        {getPaymentIcon(method)}
                        {isProcessing && paymentState.transaction?.paymentMethodId === method.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1" onClick={() => handlePaymentMethodSelect(method.id)}>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {method.name}
                          {paymentState.status === 'success' && paymentState.transaction?.paymentMethodId === method.id && (
                            <span className="text-green-600 text-xs">✓ Payment Success</span>
                          )}
                          {paymentState.status === 'error' && paymentState.transaction?.paymentMethodId === method.id && (
                            <span className="text-red-600 text-xs">✗ Payment Failed</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Balance: {formatCurrency(method.balance || 0)}
                          <span className="ml-2 text-xs text-purple-600 cursor-pointer hover:underline">
                            Click icon to test payment
                          </span>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  if (rideState.status === 'searching') {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <PyramidLoader percentage={searchPercentage} />
      </div>
    );
  }

  return (
    <div className="bg-white text-black flex flex-col h-screen">
      <div style={{ backgroundColor: PASSENGER_HEADER_BG, color: PASSENGER_HEADER_TEXT }} className="p-4 flex items-center justify-between shadow-md z-20 relative">
        <div className="flex items-center space-x-2">
          <TriGoPassengerLogoInHeader />
          <h1 className="text-xl font-bold" style={{color: PASSENGER_PAGE_ACCENT_COLOR_HSL}}>TriGo Passenger</h1>
        </div>
        <div className="flex items-center space-x-2">
           {/* Emergency Button */}
           <Button
             variant="ghost"
             size="icon"
             className="text-red-500 hover:bg-white/20 hover:text-red-600"
             title="Emergency SOS"
             onClick={handleEmergencyAlert}
             disabled={!isPremium || dailyAlertCount >= MAX_DAILY_ALERTS}
           >
             <AlertCircle size={20} />
           </Button>

          {rideState.status !== 'idle' && rideState.status !== 'selectingPickup' && (
             <Button variant="ghost" size="icon" onClick={resetRideState} title="Reset Ride" className="text-white hover:bg-white/20 hover:text-white">
                <XCircle size={20} />
             </Button>
          )}
          {loadedPassengerProfile && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={loadedPassengerProfile.profilePictureUrl} alt={loadedPassengerProfile.name} data-ai-hint="person face"/>
                <AvatarFallback>{loadedPassengerProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden sm:inline text-white">{loadedPassengerProfile.name}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" title="Search" onClick={handleSearchClick}><Search size={18}/></Button>
          <Accordion type="single" collapsible className="w-auto text-white">
            <AccordionItem value="settings" className="border-b-0">
              <AccordionTrigger className="p-1.5 hover:no-underline hover:bg-white/20 rounded" title="TriGo Settings">
                <SettingsIconLucide size={20} />
              </AccordionTrigger>
              <AccordionContent className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md text-black rounded-xl shadow-2xl p-6 z-20 border border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-neutral-800 flex items-center">
                  <SettingsIconLucide size={20} className="mr-2 text-amber-600" />
                  TriGo Settings
                </h3>
                <div className="space-y-6">
                  {/* Animation Speed */}
                  <div>
                    <AppleSlider
                      label="Animation Speed"
                      value={animationSpeed}
                      onValueChange={setAnimationSpeed}
                      min={25}
                      max={200}
                      step={25}
                      unit="%"
                      showValue={true}
                    />
                  </div>

                  {/* Map Style */}
                  <div>
                    <Label htmlFor="mapStyle" className="text-neutral-700 font-medium">Map Style</Label>
                    <Select value={currentPassengerSettings.mapStyle} onValueChange={(value: PassengerMapStyle) => setCurrentPassengerSettings(prev => ({ ...prev, mapStyle: value }))}>
                      <SelectTrigger id="mapStyle" className="mt-2 bg-white/80 text-black border-amber-300 focus:border-amber-500">
                        <SelectValue placeholder="Select map style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="streets">Streets</SelectItem>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Enable Animations */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableAnimations" className="text-neutral-700 font-medium">Enable Animations</Label>
                    <Switch
                      id="enableAnimations"
                      checked={enableAnimations}
                      onCheckedChange={setEnableAnimations}
                    />
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableSoundEffects" className="text-neutral-700 font-medium">Sound Effects</Label>
                    <Switch
                      id="enableSoundEffects"
                      checked={enableSoundEffects}
                      onCheckedChange={setEnableSoundEffects}
                    />
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableHapticFeedback" className="text-neutral-700 font-medium">Haptic Feedback</Label>
                    <Switch
                      id="enableHapticFeedback"
                      checked={enableHapticFeedback}
                      onCheckedChange={setEnableHapticFeedback}
                    />
                  </div>

                  <Button onClick={handleSavePassengerSettings} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200">
                    Save Settings
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" title="Login/Logout" onClick={handleLoginLogout}><LogInIcon size={18} /></Button>
        </div>
      </div>

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
          <NavigationControl position="bottom-left" />

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
                  rideState.pickupTodaZoneId ?? "", `hsla(33, 100%, 50%, 0.2)`,
                  'hsla(210, 50%, 60%, 0.1)'
                ],
                'fill-outline-color': ['match', ['get', 'id'],
                   rideState.pickupTodaZoneId ?? "", `hsla(33, 100%, 50%, 0.5)`,
                  'hsla(210, 50%, 60%, 0.3)'
                ],
              }}
            />
             <Layer
              id="toda-zones-border"
              type="line"
              paint={{
                'line-color': ['match', ['get', 'id'],
                   rideState.pickupTodaZoneId ?? "", `hsla(33, 100%, 50%, 0.8)`,
                  'hsla(210, 50%, 60%, 0.5)'
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
              <MapPin size={30} color={"hsl(0, 84%, 60%)"} fill={"hsl(0, 84%, 60%)"} />
            </Marker>
          )}

           {triderSimLocation && rideState.assignedTrider && (
             <Marker longitude={triderSimLocation.longitude} latitude={triderSimLocation.latitude} anchor="bottom">
                <Bike size={30} style={{color: triderToPickupRouteColor }} fill={triderToPickupRouteColor} />
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

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4 space-y-2">
          {(rideState.status === 'selectingPickup' || rideState.status === 'selectingDropoff' || rideState.status === 'confirmingRide') && (
            <Card className="bg-white/95 backdrop-blur-sm border-neutral-200 shadow-lg">
              <CardContent className="p-3 space-y-2">
                <div className="relative">
                  <Input
                    type="text" placeholder="Enter Pickup Location" value={pickupInput}
                    onChange={(e) => { setPickupInput(e.target.value); handleGeocodeSearch(e.target.value, 'pickup'); }}
                    onFocus={() => setActiveSuggestionBox('pickup')}
                    className={`w-full bg-white shadow-sm text-black ${PASSENGER_PLACEHOLDER_TEXT_COLOR} pr-10 border-neutral-300`}
                    disabled={rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff' && rideState.status !== 'confirmingRide'} />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8" onClick={() => performGeolocation(true)} disabled={isGeolocating} title="Use Current Location">
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
                       className={`w-full bg-white shadow-sm text-black ${PASSENGER_PLACEHOLDER_TEXT_COLOR} border-neutral-300`}
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

        {(rideState.status === 'confirmingRide' || rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && (
           <Alert
             className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm p-4 bg-black/70 backdrop-blur-sm shadow-xl rounded-xl"
             style={{ borderColor: PASSENGER_PAGE_ACCENT_COLOR_HSL }}
           >
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
                    <div
                        className={`text-2xl ${countdownPulseClass}`}
                        style={countdownColorStyle}
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
                        {rideState.currentRideId && <p>Ride Ticket #: {rideState.currentRideId}</p>}
                    </>
                )}
                {(rideState.status === 'searching' || rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.currentRideId &&
                    <p>Ride Ticket #: {rideState.currentRideId}</p>
                }
                {rideState.status === 'searching' && <p>Searching for the nearest available trider for you...</p>}
                {(rideState.status === 'triderAssigned' || rideState.status === 'inProgress') && rideState.assignedTrider && (
                    <>
                        <p>Trider: {rideState.assignedTrider.name} (#{rideState.assignedTrider.bodyNumber}, {rideState.assignedTrider.vehicleType})</p>
                    </>
                )}
             </AlertDescription>
             {rideState.status === 'confirmingRide' && (
                <Button className={`w-full mt-4 ${mainButtonColorClass} text-white`} onClick={handlePickMeUpNow} disabled={!rideState.pickupLocation || !rideState.dropoffLocation || rideState.estimatedFare === null} title="Request TriGo Now">
                    Request TriGo Now
                </Button>
             )}
           </Alert>
        )}

        {rideUpdates.length > 0 && (rideState.status !== 'confirmingRide' && rideState.status !== 'selectingPickup' && rideState.status !== 'selectingDropoff') && (
          <Card className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm bg-black/70 backdrop-blur-sm shadow-xl rounded-xl text-white max-h-[150px] overflow-y-auto">
            <CardContent className="p-3 text-xs space-y-1">
              <div className="flex items-center text-white/80 mb-1">
                 <History size={14} className="mr-1" />
                 <span>Ride Updates</span>
              </div>
              {rideUpdates.map((update, index) => (
                <p key={index} className="border-b border-white/20 last:border-b-0 pb-1 last:pb-0">{update}</p>
              ))}
            </CardContent>
          </Card>
        )}



        {rideState.status === 'selectingDropoff' && rideState.pickupLocation && !rideState.dropoffLocation && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <PickMeUpNowButton onClick={handleSimulateDropoffForPickMeUp} />
           </div>
        )}

         {rideState.status === 'completed' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs px-4">
                <Button className={`w-full ${mainButtonColorClass} text-white`} onClick={() => { resetRideState(); setIsReceiptDialogOpen(false); }} title="Book Another Ride">
                    Book Another Ride
                </Button>
            </div>
         )}
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

    {/* Bottom Navigation Bar */}
    <BottomNavBar />

  </div>
);
}
