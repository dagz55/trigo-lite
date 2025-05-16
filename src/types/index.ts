
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type TriderStatus = 'available' | 'busy' | 'offline' | 'assigned';
export type TriderExtendedStatus = TriderStatus | 'en-route' | 'suspended';

// Represents the geometry of a route from Mapbox Directions API
export interface RoutePath {
  type: "LineString";
  coordinates: [number, number][]; // Array of [longitude, latitude]
}

export interface TodaZone {
  id: string;
  name: string;
  areaOfOperation: string;
  center: Coordinates;
  radiusKm: number;
}

export interface Trider {
  id:string;
  name: string;
  location: Coordinates;
  status: TriderStatus;
  vehicleType?: string;
  todaZoneId: string;
  todaZoneName?: string;
  currentPath: RoutePath | null; // For following a calculated route
  pathIndex: number; // Current step/index in the currentPath
}

export type RideRequestStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'searching';

export interface RideRequest {
  id: string;
  passengerName: string;
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  pickupAddress?: string;
  dropoffAddress?: string;
  status: RideRequestStatus;
  fare?: number;
  requestedAt: Date;
  assignedTriderId?: string | null;
  pickupTodaZoneId?: string | null;
  passengerId?: string;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  relatedLocation?: Coordinates;
}

export interface TriderPaymentLog {
  id: string;
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  referenceId?: string;
}

export interface TriderRecentRideSummary {
  id: string;
  date: Date;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  commissionDeducted: number;
  netEarnings: number;
}

export interface TriderWallet {
  totalEarnedAllTime: number;
  currentBalance: number;
  todayTotalRides: number;
  todayTotalFareCollected: number;
  todayTotalCommission: number;
  todayNetEarnings: number;
  paymentLogs: TriderPaymentLog[];
  recentRides: TriderRecentRideSummary[];
}

export interface TriderProfile extends Trider {
  status: TriderExtendedStatus;
  wallet: TriderWallet;
  contactNumber?: string;
  profilePictureUrl?: string;
  dataAiHint?: string; // For AI image generation hint
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}

export type ThemeSetting = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeSetting;
  defaultMapZoom: number;
  defaultMapCenter: Coordinates;
  showHeatmap: boolean;
  rideRequestIntervalMs: number;
  triderUpdateIntervalMs: number;
  aiInsightIntervalMs: number;
}

export type UpdateSettingPayload<K extends keyof AppSettings = keyof AppSettings> = {
  key: K;
  value: AppSettings[K];
};

export interface PassengerRideState {
  status: 'idle' | 'selectingPickup' | 'selectingDropoff' | 'confirmingRide' | 'searching' | 'triderAssigned' | 'inProgress' | 'completed' | 'cancelled';
  pickupLocation: Coordinates | null;
  dropoffLocation: Coordinates | null;
  pickupAddress: string | null; // Now string for input binding
  dropoffAddress: string | null; // Now string for input binding
  estimatedFare: number | null;
  assignedTrider: TriderProfile | null;
  currentRideId: string | null;
  triderToPickupPath: RoutePath | null; // Route for trider to pickup
  pickupToDropoffPath: RoutePath | null; // Route for pickup to dropoff
  currentTriderPathIndex?: number; // Current step in the trider's path
}

export type TriderRideStatus = 'onlineAvailable' | 'onlineBusyEnRouteToPickup' | 'onlineBusyEnRouteToDropoff' | 'offline';

export interface TriderSimState {
  status: TriderRideStatus;
  currentLocation: Coordinates;
  activeRideRequest: RideRequest | null;
  availableRideRequests: RideRequest[];
  currentPath: RoutePath | null; // For trider's own navigation
  currentPathIndex: number; // Current step in their path
}
