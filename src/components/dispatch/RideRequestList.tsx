"use client";

import type { RideRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, UserCircle2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RideRequestListProps {
  rideRequests: RideRequest[];
  selectedRideRequestId: string | null;
  onSelectRideRequest: (request: RideRequest) => void;
}

const statusStyles: Record<RideRequest['status'], string> = {
  pending: 'bg-yellow-500 text-white',
  assigned: 'bg-blue-500 text-white',
  'in-progress': 'bg-purple-500 text-white',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-gray-500 text-white',
};

export function RideRequestList({ rideRequests, selectedRideRequestId, onSelectRideRequest }: RideRequestListProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Ride Requests ({rideRequests.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          {rideRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active ride requests.</p>
          ) : (
            <ul className="space-y-3">
              {rideRequests.map((request) => (
                <li key={request.id}>
                  <button
                    onClick={() => onSelectRideRequest(request)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
                      selectedRideRequestId === request.id ? "bg-primary/10 border-primary ring-2 ring-primary" : "bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary">
                          <UserCircle2 size={24} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold truncate">{request.passengerName}</p>
                          <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusStyles[request.status])}>
                            {request.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center">
                            <MapPin size={12} className="mr-1.5 text-green-500" />
                            <span className="truncate">From: {request.pickupAddress || `(${request.pickupLocation.latitude.toFixed(3)}, ${request.pickupLocation.longitude.toFixed(3)})`}</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight size={12} className="mr-1.5 text-muted-foreground" /> 
                             <span className="truncate">To: {request.dropoffAddress || `(${request.dropoffLocation.latitude.toFixed(3)}, ${request.dropoffLocation.longitude.toFixed(3)})`}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {formatDistanceToNow(request.requestedAt, { addSuffix: true })}
                          {request.fare && ` - $${request.fare.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
