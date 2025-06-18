
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { todaZones } from "@/data/todaZones";
import { mockPassengerProfiles } from "@/data/mockPassengerProfiles";
import type { MockPassengerProfile, TodaZone } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [selectedTodaZoneId, setSelectedTodaZoneId] = React.useState<string>("");
  const [selectedPassengerId, setSelectedPassengerId] = React.useState<string>("");
  const [availablePassengers, setAvailablePassengers] = React.useState<MockPassengerProfile[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (selectedTodaZoneId) {
      setAvailablePassengers(mockPassengerProfiles.filter(p => p.todaZoneId === selectedTodaZoneId));
      setSelectedPassengerId(""); // Reset passenger selection when zone changes
    } else {
      setAvailablePassengers([]);
      setSelectedPassengerId("");
    }
  }, [selectedTodaZoneId]);

  const handleLaunchSelectedPassenger = () => {
    if (!selectedPassengerId) {
      toast({
        title: "No Passenger Selected",
        description: "Please select a TODA zone and a passenger profile.",
        variant: "destructive",
      });
      return;
    }
    const passenger = mockPassengerProfiles.find(p => p.id === selectedPassengerId);
    if (passenger) {
      try {
        localStorage.setItem("selectedPassengerProfile", JSON.stringify(passenger));
        window.open("/passenger", "_blank");
        toast({
          title: "Passenger Demo Launched",
          description: `Simulating as ${passenger.name} from ${passenger.todaZoneName}.`,
        });
      } catch (error) {
        console.error("Error storing passenger profile in localStorage:", error);
        toast({
          title: "Launch Error",
          description: "Could not save passenger selection. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-primary">TriGo Beta Demo</h1>
        <p className="text-muted-foreground mt-2">
          Authentication is currently disabled for streamlined testing.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Launch Specific Passenger Demo</CardTitle>
          <CardDescription>
            Select a TODA zone and a passenger profile to simulate a specific scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="toda-zone-select">Select TODA Zone</Label>
            <Select value={selectedTodaZoneId} onValueChange={setSelectedTodaZoneId}>
              <SelectTrigger id="toda-zone-select">
                <SelectValue placeholder="Choose a TODA zone..." />
              </SelectTrigger>
              <SelectContent>
                {todaZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name} ({zone.areaOfOperation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTodaZoneId && (
            <div>
              <Label htmlFor="passenger-select">Select Passenger Profile</Label>
              <Select value={selectedPassengerId} onValueChange={setSelectedPassengerId} disabled={availablePassengers.length === 0}>
                <SelectTrigger id="passenger-select">
                  <SelectValue placeholder={availablePassengers.length > 0 ? "Choose a passenger..." : "No passengers in this zone"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePassengers.map((passenger) => (
                    <SelectItem key={passenger.id} value={passenger.id}>
                      {passenger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button 
            onClick={handleLaunchSelectedPassenger} 
            className="w-full" 
            disabled={!selectedPassengerId}
          >
            Launch Selected Passenger Demo
          </Button>
        </CardContent>
      </Card>
      
      <RoleSwitcher />

      <Button asChild variant="outline" className="mt-8">
        <Link href="/dispatcher">Go to Dispatcher Dashboard</Link>
      </Button>
    </div>
  );
}
