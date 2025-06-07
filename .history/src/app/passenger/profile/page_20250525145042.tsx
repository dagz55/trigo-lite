"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, MapPin, Phone, Settings, Star, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function PassengerProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState({
    name: "Michelle Santos",
    email: "michelle.santos@email.com",
    phone: "+63 917 123 4567",
    address: "Talon Kuatro, Las Piñas City",
    rating: 4.8,
    totalRides: 127
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  return (
    <div className="bg-white text-black flex flex-col h-screen">
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between shadow-md z-20 relative">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
            <Link href="/passenger">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-purple-400">My Profile</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Settings size={20} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-20 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium">{profile.rating}</span>
                  <span className="ml-2 text-sm text-gray-500">({profile.totalRides} rides)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-purple-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Saved Addresses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Emergency Contacts
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
