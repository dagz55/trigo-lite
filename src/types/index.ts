
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type TriderStatus = 'available' | 'busy' | 'offline' | 'assigned';
export type TriderExtendedStatus = TriderStatus | 'en-route' | 'suspended'; // 'en-route' can represent 'busy' or 'assigned'

export interface TodaZone {
  id: string;
  name: string; // toda_name
  areaOfOperation: string;
  center: Coordinates;
  radiusKm: number; // estimated_radius
}

export interface Trider {
  id:string;
  name: string;
  location: Coordinates;
  status: TriderStatus;
  vehicleType?: string; // e.g., 'Tricycle', 'Motorbike'
  todaZoneId: string;
  todaZoneName?: string;
}

export type RideRequestStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';

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
  pickupTodaZoneId?: string | null; // ID of the TODA zone for the pickup location
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  relatedLocation?: Coordinates;
}

// Types for Trider Management Dashboard
export interface TriderPaymentLog {
  id: string;
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string; 
  referenceId?: string;
}

export interface TriderRecentRideSummary {
  id: string; // ride_request_id
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
  status: TriderExtendedStatus; // Overriding with more detailed statuses
  wallet: TriderWallet;
  contactNumber?: string; // For chat/ping identification
  profilePictureUrl?: string; // For avatar
  lastSeen?: Date; // For offline status
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'dispatcher' or trider.id
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}
