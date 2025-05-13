
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type TriderStatus = 'available' | 'busy' | 'offline' | 'assigned';

export interface Trider {
  id: string;
  name: string;
  location: Coordinates;
  status: TriderStatus;
  vehicleType?: string; // e.g., 'Tricycle', 'Motorbike'
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
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  relatedLocation?: Coordinates;
}
