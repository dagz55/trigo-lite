
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bike } from "lucide-react";

export function RoleSwitcher() {
  const openPassengerRole = () => {
    window.open("/passenger", "_blank");
  };

  const openTriderRole = () => {
    window.open("/trider", "_blank");
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Role</CardTitle>
        <CardDescription>
          Select your role to explore the TriGo ride simulation experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto flex-1"
            onClick={openPassengerRole}
          >
            <User className="mr-2 h-5 w-5" />
            Passenger
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={openTriderRole}
          >
            <Bike className="mr-2 h-5 w-5" />
            Trider
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
