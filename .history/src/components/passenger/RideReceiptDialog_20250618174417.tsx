
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ticket, User, Bike, MapPin, ArrowRight, CalendarDays, CircleDollarSign, Star } from "lucide-react";
import type { PassengerRideState } from '@/types';
import { format } from 'date-fns';
import { TriderRatingForm } from './TriderRatingForm';

interface RideReceiptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  rideDetails: PassengerRideState | null;
}

export function RideReceiptDialog({ isOpen, onOpenChange, rideDetails }: RideReceiptDialogProps) {
  const [showRatingForm, setShowRatingForm] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setShowRatingForm(false); // Reset state when dialog closes
    }
  }, [isOpen]);

  if (!rideDetails || !rideDetails.assignedTrider) {
    return null;
  }

  const {
    currentRideId,
    passengerName,
    assignedTrider,
    pickupAddress,
    dropoffAddress,
    estimatedFare,
    completionTime,
  } = rideDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-xl rounded-lg">
        {!showRatingForm ? (
          <>
            <DialogHeader className="p-6">
              <DialogTitle className="text-2xl font-semibold flex items-center text-primary">
                <Ticket className="mr-3 h-7 w-7" />
                Ride Receipt
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Thank you for riding with TriGo! Here are your trip details.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket ID:</span>
                <span className="font-medium">{currentRideId || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Passenger:</span>
                <span className="font-medium">{passengerName}</span>
              </div>
              
              <Separator />

              <div>
                <h4 className="font-medium mb-1 text-muted-foreground">Trip Details:</h4>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  <p><span className="font-medium">From:</span> {pickupAddress}</p>
                </div>
                <div className="flex items-center my-1">
                  <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <p><span className="font-medium">To:</span> {dropoffAddress}</p>
                </div>
              </div>

              <Separator />
              
              <div>
                <h4 className="font-medium mb-1 text-muted-foreground">Trider Details:</h4>
                <div className="flex items-center">
                  <Bike className="h-4 w-4 mr-2 text-primary" />
                  <p><span className="font-medium">Trider:</span> {assignedTrider.name}</p>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground opacity-0" /> {/* Spacer */}
                  <p><span className="font-medium">Vehicle:</span> {assignedTrider.vehicleType}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Completed:</span>
                </div>
                <span className="font-medium">
                  {completionTime ? format(completionTime, "MMM d, yyyy 'at' HH:mm") : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                 <div className="flex items-center">
                    <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold">Total Fare:</span>
                </div>
                <span className="font-bold text-primary">
                  ₱{estimatedFare?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => setShowRatingForm(true)}
              >
                Rate Your Ride
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="p-6">
              <DialogTitle className="text-2xl font-semibold flex items-center text-primary">
                <Star className="mr-3 h-7 w-7" />
                Rate Your Experience
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                We'd love to hear about your ride with {assignedTrider.name}.
              </DialogDescription>
            </DialogHeader>
            <TriderRatingForm
              rideId={currentRideId || ""}
              triderId={assignedTrider.id}
              onRatingSubmitted={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
