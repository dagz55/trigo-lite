"use client";

import * as React from 'react';
import { MapPin, Users, Bike, LogIn, UserCircle, CircleDollarSign, CheckCircle, XCircle, Loader2, Send, Edit3, LayoutDashboard, Wallet as WalletIcon, Settings as SettingsIcon, Star, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type { Coordinates, RideRequest, TriderSimState, TriderProfile, RoutePath, TodaZone, TriderWalletTransaction, TriderAppSettings, PassengerMapStyle } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
||||||| parent of 1c0fdf2 (latest-jun182025)
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
||||||| parent of 1c0fdf2 (latest-jun182025)
import * as React from 'react';
import { MapPin, Users, Bike, LogIn, UserCircle, CircleDollarSign, CheckCircle, XCircle, Loader2, Send, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type { Coordinates, RideRequest, TriderSimState, TriderProfile, RoutePath, TodaZone, TodaZoneChangeRequestStatus } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
||||||| parent of 1c0fdf2 (latest-jun182025)
=======
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance, getRandomPointInCircle } from '@/lib/geoUtils';
import { cn } from '@/lib/utils';
import type { Coordinates, RideRequest, RoutePath, TriderProfile, TriderSimState } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Bike, ChevronDown, ChevronUp, CircleDollarSign, Edit3, Loader2, MapPin, Maximize2, Minimize2, Send, UserCircle, Users, XCircle } from 'lucide-react';
import * as React from 'react';
import Map, { Layer, MapRef, Marker, NavigationControl, Source } from 'react-map-gl';
>>>>>>> 1c0fdf2 (latest-jun182025)

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const TALON_KUATRO_ZONE_ID = '2'; 
const talonKuatroZone = appTodaZones.find(z => z.id === TALON_KUATRO_ZONE_ID);

if (!talonKuatroZone) {
  throw new Error(`Talon Kuatro zone with ID ${TALON_KUATRO_ZONE_ID} not found.`);
}

const selfTriderProfileInitial: TriderProfile = {
  id: 'trider-self-sim-tk',
  name: 'Juan Dela Cruz (You)',
  bodyNumber: "999",
  location: getRandomPointInCircle(talonKuatroZone.center, talonKuatroZone.radiusKm * 0.3),
  status: 'offline',
  vehicleType: 'E-Bike',
  todaZoneId: TALON_KUATRO_ZONE_ID,
  todaZoneName: talonKuatroZone.name,
  profilePictureUrl: `https://placehold.co/100x100.png?text=JDC`,
  dataAiHint: "driver person",
  wallet: { currentBalance: 250.75, totalEarnedAllTime: 1250.50, todayTotalRides: 0, todayTotalFareCollected: 0, todayNetEarnings: 0, todayTotalCommission: 0, paymentLogs: [], recentRides: [] },
  currentPath: null,
  pathIndex: 0,
  isOnline: false,
  requestedTodaZoneId: undefined,
  todaZoneChangeRequestStatus: 'none',
  // New fields
  walletBalance: 250.75,
  transactions: [
    { id: 'tx1', type: 'received', amount: 50, description: 'Ride 123', timestamp: new Date(Date.now() - 1000 * 60 * 30)},
    { id: 'tx2', type: 'commission', amount: -10, description: 'Commission for Ride 123', timestamp: new Date(Date.now() - 1000 * 60 * 29)},
    { id: 'tx3', type: 'payout', amount: -100, description: 'Weekly Payout', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)},
  ],
  appSettings: {
    notifications: { newRequests: true, chatMessages: true },
    mapStyle: 'streets',
  },
  subscriptionStatus: 'basic',
};

<<<<<<< HEAD
type TriderActiveView = 'dashboard' | 'wallet' | 'settings' | 'premium';
||||||| parent of 1c0fdf2 (latest-jun182025)
=======
// CollapsibleCard component
interface CollapsibleCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  title?: string;
  badge?: React.ReactNode;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ 
  id, 
  children, 
  className, 
  defaultCollapsed = false,
  title,
  badge
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    // Load saved state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`trider-card-${id}-collapsed`);
      return saved ? JSON.parse(saved) : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  const [isMinimized, setIsMinimized] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`trider-card-${id}-minimized`);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`trider-card-${id}-collapsed`, JSON.stringify(newState));
    }
  };

  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`trider-card-${id}-minimized`, JSON.stringify(newState));
    }
  };

  // Extract card header from children
  const childrenArray = React.Children.toArray(children);
  const cardHeader = childrenArray.find(child => 
    React.isValidElement(child) && child.type === CardHeader
  );
  const cardContent = childrenArray.filter(child => 
    React.isValidElement(child) && child.type !== CardHeader
  );

  if (isMinimized) {
    return (
      <Card className={cn("shadow-lg transition-all duration-300", className, "h-auto")}>
        <CardHeader className="pb-3 cursor-pointer" onClick={toggleMinimize}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {title && <CardTitle className="text-md">{title}</CardTitle>}
              {badge}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize();
              }}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg transition-all duration-300", className)}>
      {React.isValidElement(cardHeader) && React.cloneElement(cardHeader as React.ReactElement<any>, {
        children: (
          <>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {(cardHeader as React.ReactElement).props.children}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCollapse}
                  className="h-6 w-6 p-0"
                >
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )
      })}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        isCollapsed ? "max-h-0" : "max-h-[1000px]"
      )}>
        {cardContent}
      </div>
    </Card>
  );
};
>>>>>>> 1c0fdf2 (latest-jun182025)

export default function TriderPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [triderProfile, setTriderProfile] = React.useState<TriderProfile>(selfTriderProfileInitial);
  const [selectedNewZone, setSelectedNewZone] = React.useState<string>('');
  const [showQuickStats, setShowQuickStats] = React.useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

  const [activeTriderView, setActiveTriderView] = React.useState<TriderActiveView>('dashboard');
  
  const [triderAppSettings, setTriderAppSettings] = React.useState<TriderAppSettings>(
    triderProfile.appSettings || { notifications: { newRequests: true, chatMessages: true }, mapStyle: 'streets' }
  );
  const [triderWalletBalance, setTriderWalletBalance] = React.useState(triderProfile.walletBalance || 250.75);
  const [triderTransactions, setTriderTransactions] = React.useState<TriderWalletTransaction[]>(
    triderProfile.transactions || [
      { id: 'tx1', type: 'received', amount: 50, description: 'Ride ABC', timestamp: new Date(Date.now() - 3600000) },
      { id: 'tx2', type: 'commission', amount: -10, description: 'Commission for Ride ABC', timestamp: new Date(Date.now() - 3540000) },
      { id: 'tx3', type: 'payout', amount: -100, description: 'Weekly payout', timestamp: new Date(Date.now() - 86400000) },
    ]
  );
  const [triderSubscriptionStatus, setTriderSubscriptionStatus] = React.useState<'basic' | 'premium'>(
    triderProfile.subscriptionStatus || 'basic'
  );
  const [sendCoinRecipient, setSendCoinRecipient] = React.useState('');
  const [sendCoinAmount, setSendCoinAmount] = React.useState('');

  const [viewState, setViewState] = React.useState({
    longitude: triderProfile.location.longitude,
    latitude: triderProfile.location.latitude,
    zoom: defaultMapZoom + 1,
    pitch: 45,
  });

  const [triderState, setTriderState] = React.useState<TriderSimState>({
    status: 'offline',
    currentLocation: triderProfile.location,
    activeRideRequest: null,
    availableRideRequests: [],
    currentPath: null,
    currentPathIndex: 0,
  });
  
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [routeColor, setRouteColor] = React.useState('hsl(var(--accent))');
  const mapRefTrider = React.useRef<MapRef | null>(null);
  const [lastToastRideId, setLastToastRideId] = React.useState<string | null>(null);

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
      setRouteColor(accentColorVar ? parseHsl(accentColorVar) : 'green');
    }
  }, []);


  React.useEffect(() => {
    if (!settingsLoading) {
      setViewState(prev => ({
        ...prev,
        longitude: triderState.currentLocation.longitude,
        latitude: triderState.currentLocation.latitude,
        zoom: defaultMapZoom + 2, 
      }));
    }
  }, [triderState.currentLocation, defaultMapZoom, settingsLoading]);

  const handleStatusToast = React.useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({ title, description, variant });
  }, [toast]);

  React.useEffect(() => {
    let requestIntervalId: NodeJS.Timeout | undefined = undefined;

    const generateRideRequest = () => {
        if (typeof triderProfile.todaZoneId !== 'string' || !triderProfile.todaZoneId) {
            console.warn("Trider profile TODA Zone ID is invalid or missing. Skipping ride generation.", triderProfile);
            return;
        }

        const currentTriderZone = appTodaZones.find(z => z.id === triderProfile.todaZoneId);
        if (!currentTriderZone) {
            console.warn(`Trider's TODA zone (ID: ${triderProfile.todaZoneId}) not found in appTodaZones. Skipping ride generation.`);
            return;
        }

        if (appTodaZones.length === 0) {
            console.warn("TODA zones data is empty. Skipping ride generation.");
            return;
        }

        const pickupLocation = getRandomPointInCircle(currentTriderZone.center, currentTriderZone.radiusKm * 0.8);
        
        let randomDropoffZone = currentTriderZone;
        if (Math.random() > 0.7 && appTodaZones.length > 1) { 
            const otherZones = appTodaZones.filter(z => z.id !== currentTriderZone.id);
            if (otherZones.length > 0) randomDropoffZone = otherZones[Math.floor(Math.random() * otherZones.length)];
        }

        if (!randomDropoffZone) {
            console.error("Failed to select a random dropoff zone. Skipping ride generation.");
            return;
        }
        
        const dropoffLocation = getRandomPointInCircle(randomDropoffZone.center, randomDropoffZone.radiusKm * 0.8);
        
        const newRideId = `ride-req-sim-${Date.now()}`;
        const newRide: RideRequest = {
            id: newRideId,
            passengerName: `Passenger ${Math.floor(Math.random() * 100)}`,
            pickupLocation,
            dropoffLocation,
            pickupAddress: `Near ${currentTriderZone.name}`,
            dropoffAddress: `Near ${randomDropoffZone.name}`,
            status: 'pending',
            fare: calculateDistance(pickupLocation, dropoffLocation) * 20 + 30, 
            requestedAt: new Date(),
            pickupTodaZoneId: currentTriderZone.id, 
        };

        setTriderState(prev => ({
            ...prev,
            availableRideRequests: [newRide, ...prev.availableRideRequests.filter(r => r && r.id).slice(0, 4)],
        }));
    };

    if (triderState.status === 'onlineAvailable') {
        requestIntervalId = setInterval(generateRideRequest, 15000); 
    }
    
    return () => {
        if (requestIntervalId) {
            clearInterval(requestIntervalId);
        }
    };
  }, [triderState.status, triderProfile]); 
  
  React.useEffect(() => {
    if(triderState.status === 'onlineAvailable' && triderState.availableRideRequests.length > 0) {
        const latestRequest = triderState.availableRideRequests[0];
        if (latestRequest && latestRequest.id !== lastToastRideId && typeof latestRequest.pickupTodaZoneId === 'string' && latestRequest.pickupTodaZoneId === triderProfile.todaZoneId) {
          handleStatusToast("New Ride Request!", `From ${latestRequest.pickupAddress || 'N/A'} to ${latestRequest.dropoffAddress || 'N/A'}`);
          setLastToastRideId(latestRequest.id);
        }
    }
    if (triderState.status === 'offline' || triderState.activeRideRequest) {
        setLastToastRideId(null); 
    }
  }, [triderState.status, triderState.availableRideRequests, triderProfile.todaZoneId, handleStatusToast, lastToastRideId]);


  React.useEffect(() => {
    let moveIntervalId: NodeJS.Timeout;
    if (triderState.activeRideRequest && triderState.currentPath && (triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff')) {
      moveIntervalId = setInterval(() => {
        setTriderState(prev => {
          if (!prev.activeRideRequest || !prev.currentPath || prev.currentPathIndex === undefined) return prev;
          
          const targetLocation = prev.status === 'onlineBusyEnRouteToPickup' ? prev.activeRideRequest.pickupLocation : prev.activeRideRequest.dropoffLocation;
          let nextIdx = prev.currentPathIndex + 1;

          if (nextIdx < prev.currentPath.coordinates.length) {
            const newLocation = {
              longitude: prev.currentPath.coordinates[nextIdx][0],
              latitude: prev.currentPath.coordinates[nextIdx][1],
            };
            setTriderProfile(p => ({...p, location: newLocation}));
            return { ...prev, currentLocation: newLocation, currentPathIndex: nextIdx };
          } else { 
             setTriderProfile(p => ({...p, location: targetLocation}));
             return { ...prev, currentLocation: targetLocation, currentPathIndex: prev.currentPath.coordinates.length -1 };
          }
        });
      }, 2000); 
    }
    return () => clearInterval(moveIntervalId);
  }, [triderState.status, triderState.activeRideRequest, triderState.currentPath]);

  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setTriderState(prev => ({ ...prev, status: 'onlineAvailable', currentLocation: coords }));
          setTriderProfile(prev => ({ ...prev, location: coords, status: 'available', isOnline: true })); 
          setViewState(prev => ({ ...prev, ...coords, zoom: 16 }));
          setIsGeolocating(false);
          handleStatusToast("You are Online!", `Waiting for ride requests in ${triderProfile.todaZoneName}.`);
        },
        (error) => {
          console.warn("Error getting geolocation for trider:", error.message);
          const currentTodaZoneCenter = appTodaZones.find(z => z.id === triderProfile.todaZoneId)?.center || selfTriderProfileInitial.location;
          setTriderState(prev => ({ ...prev, status: 'onlineAvailable', currentLocation: currentTodaZoneCenter }));
          setTriderProfile(prev => ({ ...prev, location: currentTodaZoneCenter, status: 'available', isOnline: true }));
          setViewState(prev => ({ ...prev, ...currentTodaZoneCenter, zoom: 15 }));
          setIsGeolocating(false);
          handleStatusToast("You are Online!", `Using default ${triderProfile.todaZoneName} location. Waiting for ride requests.`);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (triderState.activeRideRequest) {
        handleStatusToast("Cannot Go Offline", "Please complete or cancel your active ride first.", "destructive");
        return;
      }
      setTriderState(prev => ({ ...prev, status: 'offline', availableRideRequests: [], activeRideRequest: null, currentPath: null, currentPathIndex: 0 }));
      setTriderProfile(prev => ({ ...prev, status: 'offline', isOnline: false }));
      handleStatusToast("You are Offline", "");
    }
  };

  const fetchAndSetRoute = async (start: Coordinates, end: Coordinates) => {
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
           toast({ title: "Route Calculated (Shortest Distance)", description: `Using shortest of ${data.routes.length} alternatives for trider.` });
        } else {
          chosenRoute = data.routes[0];
        }
        const path: RoutePath = chosenRoute.geometry;
        setTriderState(prev => ({ ...prev, currentPath: path, currentPathIndex: 0 }));
        return path;
      } else {
        toast({ title: "Route Error", description: data.message || "Could not calculate route for trider.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching route for trider map:", error);
      handleStatusToast("Route Error", "Could not calculate route.", "destructive");
    }
    return null;
  };

  const handleAcceptRide = async (request: RideRequest) => {
    if (triderState.status !== 'onlineAvailable') {
      handleStatusToast("Cannot Accept Ride", "You must be online and available.", "destructive");
      return;
    }
    if (request.pickupTodaZoneId !== triderProfile.todaZoneId) {
        handleStatusToast("Out of Zone", "This ride request is outside your assigned TODA zone.", "destructive");
        setTriderState(prev => ({
          ...prev,
          availableRideRequests: prev.availableRideRequests.filter(r => r.id !== request.id) 
        }));
        return;
    }

    const path = await fetchAndSetRoute(triderState.currentLocation, request.pickupLocation);
    if (path) {
        setTriderState(prev => ({
        ...prev,
        status: 'onlineBusyEnRouteToPickup',
        activeRideRequest: request,
        availableRideRequests: prev.availableRideRequests.filter(r => r.id !== request.id) 
        }));
        setTriderProfile(prev => ({ ...prev, status: 'en-route' }));
        handleStatusToast("Ride Accepted!", `Proceed to ${request.pickupAddress}.`);
    }
  };
  
  const handlePickedUp = async () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToPickup') return;
    const atPickup = triderState.currentPath && triderState.currentPathIndex >= triderState.currentPath.coordinates.length - 1;

    if (!atPickup && calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) > 0.05) { 
        handleStatusToast("Not at Pickup Yet", "Please proceed closer to the pickup location or ensure path is complete.", "destructive");
        return;
    }
    const path = await fetchAndSetRoute(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation);
    if (path) {
        setTriderState(prev => ({...prev, status: 'onlineBusyEnRouteToDropoff', currentPathIndex: 0}));
        handleStatusToast("Passenger Picked Up", `Proceed to ${triderState.activeRideRequest.dropoffAddress}.`);
    }
  };

  const handleCompleteRide = () => {
    if (!triderState.activeRideRequest || triderState.status !== 'onlineBusyEnRouteToDropoff') return;
    const atDropoff = triderState.currentPath && triderState.currentPathIndex >= triderState.currentPath.coordinates.length - 1;

     if (!atDropoff && calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) > 0.05) { 
        handleStatusToast("Not at Dropoff Yet", "Please proceed closer to the destination or ensure path is complete.", "destructive");
        return;
    }
    const fare = triderState.activeRideRequest.fare || 0;
    const earnings = fare * 0.8; 
    
    const newTransaction: TriderWalletTransaction = {
      id: `tx-ride-${Date.now()}`,
      type: 'received',
      amount: earnings,
      description: `Earnings from ride #${triderState.activeRideRequest.id.slice(-4)}`,
      timestamp: new Date()
    };
    setTriderTransactions(prev => [newTransaction, ...prev]);
    setTriderWalletBalance(prev => prev + earnings);

    setTriderProfile(prev => ({
        ...prev,
        status: 'available', 
        walletBalance: (prev.walletBalance || 0) + earnings,
        transactions: [newTransaction, ...(prev.transactions || [])].slice(0,10),
        wallet: {
            ...prev.wallet,
<<<<<<< HEAD
            currentBalance: (prev.wallet.currentBalance || 0) + earnings,
            totalEarnedAllTime: (prev.wallet.totalEarnedAllTime || 0) + earnings,
            todayTotalRides: (prev.wallet.todayTotalRides || 0) + 1,
            todayTotalFareCollected: (prev.wallet.todayTotalFareCollected || 0) + fare,
            todayNetEarnings: (prev.wallet.todayNetEarnings || 0) + earnings,
            recentRides: [{id: prev.activeRideRequest!.id, date: new Date(), pickupAddress: prev.activeRideRequest!.pickupAddress || 'N/A', dropoffAddress: prev.activeRideRequest!.dropoffAddress || 'N/A', fare, commissionDeducted: fare * 0.2, netEarnings: earnings}, ...prev.wallet.recentRides.slice(0,4)]
||||||| parent of 1c0fdf2 (latest-jun182025)
            currentBalance: prev.wallet.currentBalance + earnings,
            totalEarnedAllTime: prev.wallet.totalEarnedAllTime + earnings,
            todayTotalRides: prev.wallet.todayTotalRides + 1,
            todayTotalFareCollected: prev.wallet.todayTotalFareCollected + fare,
            todayNetEarnings: prev.wallet.todayNetEarnings + earnings,
            recentRides: [{id: prev.activeRideRequest!.id, date: new Date(), pickupAddress: prev.activeRideRequest!.pickupAddress || 'N/A', dropoffAddress: prev.activeRideRequest!.dropoffAddress || 'N/A', fare, commissionDeducted: fare * 0.2, netEarnings: earnings}, ...prev.wallet.recentRides.slice(0,4)]
=======
            currentBalance: prev.wallet.currentBalance + earnings,
            totalEarnedAllTime: prev.wallet.totalEarnedAllTime + earnings,
            todayTotalRides: prev.wallet.todayTotalRides + 1,
            todayTotalFareCollected: prev.wallet.todayTotalFareCollected + fare,
            todayNetEarnings: prev.wallet.todayNetEarnings + earnings,
            recentRides: [{id: triderState.activeRideRequest!.id, date: new Date(), pickupAddress: triderState.activeRideRequest!.pickupAddress || 'N/A', dropoffAddress: triderState.activeRideRequest!.dropoffAddress || 'N/A', fare, commissionDeducted: fare * 0.2, netEarnings: earnings}, ...prev.wallet.recentRides.slice(0,4)]
>>>>>>> 1c0fdf2 (latest-jun182025)
        }
    }));

    setTriderState(prev => ({
        ...prev, status: 'onlineAvailable', activeRideRequest: null, currentPath: null, currentPathIndex: 0,
    }));
    handleStatusToast("Ride Completed!", `Earned ₱${earnings.toFixed(2)}. Waiting for next ride.`);
  };

  const handleRequestZoneChange = () => {
    if (!selectedNewZone || selectedNewZone === triderProfile.todaZoneId) {
      handleStatusToast("Invalid Zone", "Please select a different TODA zone.", "destructive");
      return;
    }
    if (triderProfile.todaZoneChangeRequestStatus === 'pending') {
      handleStatusToast("Request Pending", "You already have a pending zone change request.", "destructive");
      return;
    }
    setTriderProfile(prev => ({
      ...prev,
      requestedTodaZoneId: selectedNewZone,
      todaZoneChangeRequestStatus: 'pending'
    }));
    handleStatusToast("Zone Change Requested", `Request to move to ${appTodaZones.find(z => z.id === selectedNewZone)?.name} sent.`);
  };

  const handleSaveTriderSettings = () => {
    setTriderProfile(prev => ({ ...prev, appSettings: triderAppSettings }));
    // Simulate saving to localStorage
    try {
      localStorage.setItem(`triderAppSettings_${triderProfile.id}`, JSON.stringify(triderAppSettings));
      handleStatusToast("Settings Saved", "Your preferences have been updated for this session.");
    } catch (error) {
      console.error("Error saving trider settings to localStorage:", error);
      handleStatusToast("Save Error", "Could not save settings.", "destructive");
    }
  };

  const handleSendTriCoin = () => {
    const amount = parseFloat(sendCoinAmount);
    if (!sendCoinRecipient.trim() || isNaN(amount) || amount <= 0) {
      handleStatusToast("Invalid Input", "Please enter a valid recipient and amount.", "destructive");
      return;
    }
    if (amount > triderWalletBalance) {
      handleStatusToast("Insufficient Balance", "You do not have enough TriCoin.", "destructive");
      return;
    }
    // Mock transaction
    const newTx: TriderWalletTransaction = {
      id: `send-${Date.now()}`, type: 'sent', amount: -amount,
      description: `Sent to ${sendCoinRecipient}`, timestamp: new Date()
    };
    setTriderTransactions(prev => [newTx, ...prev].slice(0,10));
    setTriderWalletBalance(prev => prev - amount);
    setSendCoinRecipient('');
    setSendCoinAmount('');
    handleStatusToast("TriCoin Sent (Mock)", `₱${amount.toFixed(2)} sent to ${sendCoinRecipient}.`);
  };

  const handleAddTriCoin = () => {
    // Mock adding funds
    const addedAmount = 100; // Mock amount
    const newTx: TriderWalletTransaction = {
      id: `add-${Date.now()}`, type: 'added', amount: addedAmount,
      description: `Added funds via GCash (Mock)`, timestamp: new Date()
    };
    setTriderTransactions(prev => [newTx, ...prev].slice(0,10));
    setTriderWalletBalance(prev => prev + addedAmount);
    handleStatusToast("Funds Added (Mock)", `₱${addedAmount.toFixed(2)} added to your wallet.`);
  };
  
  const routeLayerConfig: any = {
    id: 'route-trider', type: 'line', source: 'route-trider',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': routeColor, 'line-width': 5, 'line-opacity': 0.8 },
  };

  React.useEffect(() => {
    // Load trider settings from localStorage
    try {
      const storedSettings = localStorage.getItem(`triderAppSettings_${triderProfile.id}`);
      if (storedSettings) {
        setTriderAppSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading trider settings:", error);
    }
  }, [triderProfile.id]);

  const mapStyleUrl = React.useMemo(() => {
    switch (triderAppSettings.mapStyle) {
      case 'satellite': return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'dark': return 'mapbox://styles/mapbox/dark-v11';
      default: return 'mapbox://styles/mapbox/streets-v12';
    }
  }, [triderAppSettings.mapStyle]);

<<<<<<< HEAD
  const renderDashboardView = () => (
    <>
      <header className="p-4 border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <Bike className="mr-2" /> {triderProfile.todaZoneName} Trider (#{triderProfile.bodyNumber})
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="online-toggle" className={triderState.status !== 'offline' ? "text-accent" : "text-muted-foreground"}>
            {isGeolocating ? "Geolocating..." : (triderState.status !== 'offline' ? 'Online' : 'Offline')}
          </Label>
          <Switch
            id="online-toggle"
            checked={triderState.status !== 'offline'}
            onCheckedChange={handleToggleOnline}
            disabled={isGeolocating || triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff'}
          />
||||||| parent of 1c0fdf2 (latest-jun182025)
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <Bike className="mr-2" /> {triderProfile.todaZoneName} Trider
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="online-toggle" className={triderState.status !== 'offline' ? "text-accent" : "text-muted-foreground"}>
            {isGeolocating ? "Geolocating..." : (triderState.status !== 'offline' ? 'Online' : 'Offline')}
          </Label>
          <Switch
            id="online-toggle"
            checked={triderState.status !== 'offline'}
            onCheckedChange={handleToggleOnline}
            disabled={isGeolocating || triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff'}
          />
=======
  // Ride content component to share between mobile sheet and desktop card
  const RideContent = () => (
    <>
      {triderState.activeRideRequest ? (
        <div className="space-y-2">
          <p><strong>Passenger:</strong> {triderState.activeRideRequest.passengerName}</p>
          <p className="text-sm"><strong>From:</strong> {triderState.activeRideRequest.pickupAddress}</p>
          <p className="text-sm"><strong>To:</strong> {triderState.activeRideRequest.dropoffAddress}</p>
          <p className="text-sm"><strong>Est. Fare:</strong> ₱{triderState.activeRideRequest.fare?.toFixed(2)}</p>
          {triderState.status === 'onlineBusyEnRouteToPickup' && 
            <Button 
                onClick={handlePickedUp} 
                className="w-full mt-2" 
                disabled={!(triderState.currentPath && triderState.currentPathIndex >= triderState.currentPath.coordinates.length - 1 || calculateDistance(triderState.currentLocation, triderState.activeRideRequest.pickupLocation) < 0.05)}
            >Mark as Picked Up</Button>}
          {triderState.status === 'onlineBusyEnRouteToDropoff' && 
            <Button 
                onClick={handleCompleteRide} 
                className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground" 
                disabled={!(triderState.currentPath && triderState.currentPathIndex >= triderState.currentPath.coordinates.length - 1 || calculateDistance(triderState.currentLocation, triderState.activeRideRequest.dropoffLocation) < 0.05)}
            >Complete Ride</Button>}
        </div>
      ) : triderState.availableRideRequests.filter(req => req.pickupTodaZoneId === triderProfile.todaZoneId).length > 0 ? (
         <ScrollArea className="h-[200px] pr-3">
            <ul className="space-y-3">
            {triderState.availableRideRequests.filter(req => req.pickupTodaZoneId === triderProfile.todaZoneId).map(req => (
                <li key={req.id} className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-sm">{req.passengerName}</p>
                            <p className="text-xs text-muted-foreground">To: {req.dropoffAddress}</p>
                            <p className="text-xs text-muted-foreground">Fare: ~₱{req.fare?.toFixed(2)}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAcceptRide(req)} disabled={triderState.status !== 'onlineAvailable'}>
                            Accept
                        </Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">
                        From: {req.pickupAddress} ({appTodaZones.find(z=>z.id === req.pickupTodaZoneId)?.name})
                    </p>
                     <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(req.requestedAt, { addSuffix: true })}
                    </p>
                </li>
            ))}
            </ul>
         </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          {triderState.status === 'onlineAvailable' ? `No ride requests in ${triderProfile.todaZoneName} currently. Waiting...` : "Go online to see ride requests."}
        </p>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary flex items-center">
            <Bike className="mr-2" /> {triderProfile.todaZoneName} Trider
          </h1>
          <div className="flex items-center gap-4">
            {/* Quick Stats Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickStats(!showQuickStats)}
              className="hidden md:flex items-center gap-2"
            >
              <CircleDollarSign className="h-4 w-4" />
              <span className="text-sm">Quick Stats</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="online-toggle" className={triderState.status !== 'offline' ? "text-accent" : "text-muted-foreground"}>
                {isGeolocating ? "Geolocating..." : (triderState.status !== 'offline' ? 'Online' : 'Offline')}
              </Label>
              <Switch
                id="online-toggle"
                checked={triderState.status !== 'offline'}
                onCheckedChange={handleToggleOnline}
                disabled={isGeolocating || triderState.status === 'onlineBusyEnRouteToPickup' || triderState.status === 'onlineBusyEnRouteToDropoff'}
              />
            </div>
          </div>
>>>>>>> 1c0fdf2 (latest-jun182025)
        </div>

        {/* Floating Quick Stats Panel */}
        {showQuickStats && (
          <div className="absolute top-20 right-4 z-20 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Quick Stats</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickStats(false)}
                className="h-6 w-6 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">₱{triderProfile.wallet.currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Today's Rides:</span>
                <span className="font-medium">{triderProfile.wallet.todayTotalRides}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Today's Earnings:</span>
                <span className="font-medium text-green-600">₱{triderProfile.wallet.todayNetEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 md:p-4 overflow-hidden">
        <div className="md:col-span-1 flex flex-col gap-4 p-4 md:p-0 h-full">
          <CollapsibleCard 
            id="ride-requests" 
            className="flex-shrink-0"
            title={triderState.activeRideRequest ? "Active Ride" : "Available Requests"}
            badge={
              <Badge variant={triderState.status === 'offline' ? "destructive" : triderState.status === 'onlineAvailable' ? "default" : "secondary"} className="capitalize text-xs">
                {triderState.status.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
              </Badge>
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{triderState.activeRideRequest ? "Active Ride" : "Available Requests"}</span>
                 <Badge variant={triderState.status === 'offline' ? "destructive" : triderState.status === 'onlineAvailable' ? "default" : "secondary"} className="capitalize text-xs">
                  {triderState.status.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[150px]">
              <RideContent />
            </CardContent>
          </CollapsibleCard>
          
          <CollapsibleCard 
            id="trider-profile" 
            className="mt-auto"
            title={triderProfile.name}
          >
             <CardHeader>
                <CardTitle className="text-md flex items-center"><UserCircle className="mr-2"/>{triderProfile.name} (#{triderProfile.bodyNumber})</CardTitle>
                <CardDescription>Current TODA: {triderProfile.todaZoneName} - {triderProfile.vehicleType}</CardDescription>
             </CardHeader>
             <CardContent className="text-sm space-y-3">
                <div>
                    <p><CircleDollarSign className="inline mr-1 h-4 w-4"/>Balance: ₱{triderProfile.wallet.currentBalance.toFixed(2)}</p>
                    <p>Today's Rides: {triderProfile.wallet.todayTotalRides}</p>
                    <p>Today's Earnings: ₱{triderProfile.wallet.todayNetEarnings.toFixed(2)}</p>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="change-zone-select">Request TODA Zone Change</Label>
                  {triderProfile.todaZoneChangeRequestStatus === 'pending' && (
                    <Alert variant="default">
                      <Edit3 className="h-4 w-4" />
                      <AlertTitle>Request Pending</AlertTitle>
                      <AlertDescription>
                        Your request to move to {appTodaZones.find(z => z.id === triderProfile.requestedTodaZoneId)?.name || 'another zone'} is pending approval.
                      </AlertDescription>
                    </Alert>
                  )}
                  {triderProfile.todaZoneChangeRequestStatus !== 'pending' && (
                    <>
                      <Select value={selectedNewZone} onValueChange={setSelectedNewZone}>
                        <SelectTrigger id="change-zone-select">
                          <SelectValue placeholder="Select new TODA zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {appTodaZones.filter(z => z.id !== triderProfile.todaZoneId).map(zone => (
                            <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleRequestZoneChange} className="w-full" size="sm" disabled={!selectedNewZone}>
                        <Send className="mr-2 h-4 w-4" /> Request Change
                      </Button>
                    </>
                  )}
                </div>
             </CardContent>
          </CollapsibleCard>
        </div>

        <div className="md:col-span-2 h-[300px] md:h-full min-h-[300px] rounded-lg overflow-hidden shadow-lg border relative">
          {/* Floating Map Controls */}
          <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-2 border">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Map View
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (mapRefTrider.current) {
                    mapRefTrider.current.flyTo({
                      center: [triderState.currentLocation.longitude, triderState.currentLocation.latitude],
                      zoom: 16,
                      duration: 1000
                    });
                  }
                }}
                className="h-7 px-2"
              >
                <UserCircle className="h-4 w-4 mr-1" />
                Center
              </Button>
            </div>
          </div>

          <Map
            {...viewState}
            ref={mapRefTrider}
            onMove={evt => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyleUrl}
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={triderState.currentLocation.longitude} latitude={triderState.currentLocation.latitude}>
              <div className={`p-1.5 rounded-full shadow-md ${triderState.status === 'offline' ? 'bg-muted' : 'bg-primary text-primary-foreground animate-pulse'}`}>
                <Bike size={20} data-ai-hint="motorcycle location"/>
              </div>
            </Marker>

            {triderState.activeRideRequest && (
              <>
                <Marker longitude={triderState.activeRideRequest.pickupLocation.longitude} latitude={triderState.activeRideRequest.pickupLocation.latitude} color="green">
                   <div title="Pickup" className="p-1 rounded-full bg-green-500 text-white shadow-md"><MapPin size={16}/></div>
                </Marker>
                <Marker longitude={triderState.activeRideRequest.dropoffLocation.longitude} latitude={triderState.activeRideRequest.dropoffLocation.latitude} color="red">
                    <div title="Dropoff" className="p-1 rounded-full bg-red-500 text-white shadow-md"><MapPin size={16}/></div>
                </Marker>
              </>
            )}
            
            {triderState.status === 'onlineAvailable' && triderState.availableRideRequests.map(req => (
                req.pickupTodaZoneId === triderProfile.todaZoneId &&
                <Marker key={`req-${req.id}`} longitude={req.pickupLocation.longitude} latitude={req.pickupLocation.latitude}>
                     <button onClick={() => handleAcceptRide(req)} title={`Accept ride for ${req.passengerName}`} className="cursor-pointer">
                        <div className="p-1.5 rounded-full bg-yellow-400 text-yellow-900 shadow-md hover:scale-110 transition-transform" data-ai-hint="passenger pickup">
                            <Users size={18}/>
                        </div>
                     </button>
                </Marker>
            ))}

            {triderState.currentPath && (
              <Source id="route-trider" type="geojson" data={{ type: 'Feature', geometry: triderState.currentPath, properties:{} }}>
                <Layer {...routeLayerConfig} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </>
  );

  const renderWalletView = () => (
    <ScrollArea className="h-full p-4 md:p-6">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><WalletIcon className="mr-2 text-primary" /> My Wallet</CardTitle>
          <CardDescription>Manage your TriCoins and view transaction history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Balance</Label>
            <p className="text-3xl font-bold text-primary">₱{triderWalletBalance.toFixed(2)}</p>
          </div>
          <Separator />
          <div>
            <Label htmlFor="send-recipient">Send TriCoin (Mock)</Label>
            <div className="flex gap-2 mt-1">
              <Input id="send-recipient" placeholder="Recipient ID/Username" value={sendCoinRecipient} onChange={e => setSendCoinRecipient(e.target.value)} />
              <Input type="number" placeholder="Amount" value={sendCoinAmount} onChange={e => setSendCoinAmount(e.target.value)} className="w-32" />
              <Button onClick={handleSendTriCoin}><Send size={16} className="mr-2" />Send</Button>
            </div>
          </div>
          <Button onClick={handleAddTriCoin} variant="outline" className="w-full">Add TriCoin (Mock GCash Top-up)</Button>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {triderTransactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="space-y-3">
              {triderTransactions.map(tx => (
                <li key={tx.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{format(tx.timestamp, "MMM d, yyyy HH:mm")}</p>
                  </div>
                  <span className={cn("font-semibold", tx.amount > 0 ? "text-green-500" : "text-red-500")}>
                    {tx.amount > 0 ? '+' : ''}₱{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );

  const renderSettingsView = () => (
    <ScrollArea className="h-full p-4 md:p-6">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><SettingsIcon className="mr-2 text-primary" /> Trider Settings</CardTitle>
          <CardDescription>Customize your app preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base">Notifications</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-new-requests">New Ride Requests</Label>
                <Switch 
                  id="notif-new-requests" 
                  checked={triderAppSettings.notifications.newRequests}
                  onCheckedChange={checked => setTriderAppSettings(s => ({...s, notifications: {...s.notifications, newRequests: checked}}))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-chat">Chat Messages</Label>
                <Switch 
                  id="notif-chat"
                  checked={triderAppSettings.notifications.chatMessages}
                  onCheckedChange={checked => setTriderAppSettings(s => ({...s, notifications: {...s.notifications, chatMessages: checked}}))}
                />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <Label htmlFor="map-style-select" className="text-base">Map Style</Label>
            <Select 
              value={triderAppSettings.mapStyle} 
              onValueChange={(value: PassengerMapStyle) => setTriderAppSettings(s => ({...s, mapStyle: value}))}
            >
              <SelectTrigger id="map-style-select" className="mt-2">
                <SelectValue placeholder="Select map style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streets">Streets</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveTriderSettings} className="w-full">Save Settings</Button>
        </CardFooter>
      </Card>
    </ScrollArea>
  );

  const renderPremiumView = () => (
     <ScrollArea className="h-full p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Star className="h-12 w-12 text-yellow-400 mb-2" />
          <CardTitle className="text-2xl">TriGo Premium</CardTitle>
          <CardDescription>
            {triderSubscriptionStatus === 'premium' 
              ? "You are a Premium Trider!" 
              : "Unlock exclusive benefits with Premium."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {triderSubscriptionStatus === 'basic' && (
            <Button 
              onClick={() => { 
                setTriderSubscriptionStatus('premium');
                handleStatusToast("Welcome to Premium! (Mock)", "All premium features are now active.");
              }} 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              size="lg"
            >
              Upgrade to Premium Now (Mock)
            </Button>
          )}
          <ul className="list-disc list-inside text-left space-y-1 text-sm text-muted-foreground">
            <li>Priority in ride assignments</li>
            <li>Lower commission rates (Coming Soon)</li>
            <li>Access to exclusive TODA zones (Coming Soon)</li>
            <li>Advanced analytics (Coming Soon)</li>
            <li>24/7 Priority Support (Coming Soon)</li>
          </ul>
           {triderSubscriptionStatus === 'premium' && (
            <Button 
              onClick={() => {
                 setTriderSubscriptionStatus('basic');
                 handleStatusToast("Subscription Changed (Mock)", "You are now on the Basic plan.");
              }} 
              variant="outline"
              className="w-full mt-4"
            >
              Downgrade to Basic (Mock)
            </Button>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );

  const navItems = [
    { view: 'dashboard' as TriderActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { view: 'wallet' as TriderActiveView, label: 'Wallet', icon: WalletIcon },
    { view: 'settings' as TriderActiveView, label: 'Settings', icon: SettingsIcon },
    { view: 'premium' as TriderActiveView, label: 'Premium', icon: Star },
  ];

  if (settingsLoading || !MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /><p>Loading Trider Dashboard...</p></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-grow overflow-y-auto">
        {activeTriderView === 'dashboard' && renderDashboardView()}
        {activeTriderView === 'wallet' && renderWalletView()}
        {activeTriderView === 'settings' && renderSettingsView()}
        {activeTriderView === 'premium' && renderPremiumView()}
      </div>

      <nav className="border-t bg-card shadow-md">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-px">
          {navItems.map(item => (
            <Button
              key={item.view}
              variant="ghost"
              onClick={() => setActiveTriderView(item.view)}
              className={cn(
                "flex flex-col items-center justify-center h-16 rounded-none text-xs hover:bg-accent hover:text-accent-foreground transition-colors",
                activeTriderView === item.view ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} className="mb-0.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}

