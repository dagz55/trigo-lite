"use client";

import * as React from 'react';
import { MapPin, Users, Bike, LogIn, UserCircle, CircleDollarSign, CheckCircle, XCircle, Loader2, Send, Edit3, LayoutDashboard, Wallet as WalletIcon, Settings as SettingsIcon, Star, ChevronRight, MessageSquare, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import type { Coordinates, RideRequest, TriderSimState, TriderProfile, RoutePath, TodaZone, TriderWalletTransaction, TriderAppSettings, PassengerMapStyle, TodaZoneChangeRequestStatus } from '@/types';
import { todaZones as appTodaZones } from '@/data/todaZones';
import { getRandomPointInCircle, calculateDistance } from '@/lib/geoUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

type TriderActiveView = 'dashboard' | 'wallet' | 'settings' | 'premium';

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

export default function TriderPage() {
  const { defaultMapCenter, defaultMapZoom, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [triderProfile, setTriderProfile] = React.useState<TriderProfile>(selfTriderProfileInitial);
  const [selectedNewZone, setSelectedNewZone] = React.useState<string>('');
  const [showQuickStats, setShowQuickStats
