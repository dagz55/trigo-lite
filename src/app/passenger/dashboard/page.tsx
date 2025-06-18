'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Car, Clock, MapPin, Star, TrendingUp, Wallet } from "lucide-react";
import Link from 'next/link';

// Mock data for demonstration
const mockPassengerProfile = {
  id: 'passenger-1',
  name: 'Maria Santos',
  email: 'maria.santos@email.com',
  phone: '+63 912 345 6789',
  memberSince: '2023-06-15',
  totalRides: 47,
  favoriteDestination: 'Alabang Town Center',
  rating: 4.8,
  profileImage: null
};

const mockRideHistory = [
  {
    id: 'ride-1',
    date: '2024-01-15',
    time: '14:30',
    pickup: 'Talon Kuatro Area',
    dropoff: 'SM Southmall',
    fare: 85.00,
    triderName: 'Juan Dela Cruz',
    rating: 5,
    status: 'completed'
  },
  {
    id: 'ride-2',
    date: '2024-01-14',
    time: '09:15',
    pickup: 'BF Homes Area',
    dropoff: 'Festival Mall',
    fare: 120.00,
    triderName: 'Pedro Martinez',
    rating: 4,
    status: 'completed'
  },
  {
    id: 'ride-3',
    date: '2024-01-13',
    time: '18:45',
    pickup: 'Pilar Village',
    dropoff: 'Starmall Las Piñas',
    fare: 65.00,
    triderName: 'Carlos Reyes',
    rating: 5,
    status: 'completed'
  }
];

const mockStats = {
  totalSpent: 2450.00,
  averageFare: 78.50,
  totalDistance: 245.8,
  carbonSaved: 12.3
};

export default function PassengerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {mockPassengerProfile.name}!</p>
          </div>
          <Link href="/passenger">
            <Button variant="outline">
              <Car className="mr-2 h-4 w-4" />
              Book a Ride
            </Button>
          </Link>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Avatar className="mr-3 h-12 w-12">
                <AvatarImage src={mockPassengerProfile.profileImage || undefined} />
                <AvatarFallback>{mockPassengerProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{mockPassengerProfile.name}</h2>
                <p className="text-sm text-gray-600">{mockPassengerProfile.email}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">{new Date(mockPassengerProfile.memberSince).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Car className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Total Rides</p>
                <p className="font-semibold">{mockPassengerProfile.totalRides}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold">{mockPassengerProfile.rating}/5.0</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-gray-600">Favorite Destination</p>
                <p className="font-semibold text-xs">{mockPassengerProfile.favoriteDestination}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{mockStats.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fare</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{mockStats.averageFare.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per ride average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distance Traveled</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalDistance} km</div>
              <p className="text-xs text-muted-foreground">Total distance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.carbonSaved} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ emissions saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
            <CardDescription>Your latest ride history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRideHistory.map((ride, index) => (
                <div key={ride.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {ride.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(ride.date).toLocaleDateString()} at {ride.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{ride.pickup}</span>
                        <span className="text-gray-400">→</span>
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{ride.dropoff}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Trider: {ride.triderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₱{ride.fare.toFixed(2)}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < ride.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {index < mockRideHistory.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All Rides</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/passenger/wallet">
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="mr-2 h-4 w-4" />
                  Manage Wallet
                </Button>
              </Link>
              <Link href="/passenger/premium">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="mr-2 h-4 w-4" />
                  Premium Features
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Ride History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
