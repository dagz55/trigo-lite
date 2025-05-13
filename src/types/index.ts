
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type TriderStatus = 'available' | 'busy' | 'offline' | 'assigned';

export interface TodaZone {
  id: string;
  name: string; // toda_name
  areaOfOperation: string;
  center: Coordinates;
  radiusKm: number; // estimated_radius
}

export interface Trider {
  id: string;
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

