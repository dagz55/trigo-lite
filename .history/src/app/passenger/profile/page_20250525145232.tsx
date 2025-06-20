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

  const [paymentMethods, setPaymentMethods] = React.useState([
    { id: 'gcash', name: 'GCash', type: 'ewallet', isDefault: true, balance: 1250.50 },
    { id: 'paymaya', name: 'PayMaya', type: 'ewallet', isDefault: false, balance: 850.25 },
    { id: 'tricoin', name: 'TriCoin', type: 'crypto', isDefault: false, balance: 45.75 }
  ]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
    const method = paymentMethods.find(m => m.id === methodId);
    toast({
      title: "Default Payment Updated",
      description: `${method?.name} is now your default payment method.`,
    });
  };

  const getPaymentIcon = (method: any) => {
    switch (method.id) {
      case 'gcash':
        return <img src="/GCash.png" alt="GCash" className="w-6 h-6" />;
      case 'paymaya':
        return <img src="/maya-logo.png" alt="PayMaya" className="w-6 h-6" />;
      case 'tricoin':
        return <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">₮</span>
        </div>;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
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
              {/* Payment Methods Dialog */}
              <div className="w-full">
                <div className="w-full">
                  <div className="w-full">
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      // Create a temporary dialog state
                      const dialog = document.createElement('div');
                      dialog.innerHTML = `
                        <div class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                          <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <div class="flex justify-between items-center mb-4">
                              <h2 class="text-lg font-semibold">Payment Methods</h2>
                              <button class="close-dialog text-gray-500 hover:text-gray-700">×</button>
                            </div>
                            <div class="space-y-3">
                              ${paymentMethods.map(method => `
                                <div class="flex items-center justify-between p-3 border rounded-lg ${method.isDefault ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}">
                                  <div class="flex items-center space-x-3">
                                    <div class="payment-icon">
                                      ${method.id === 'gcash' ? '<img src="/GCash.png" alt="GCash" class="w-6 h-6" />' :
                                        method.id === 'paymaya' ? '<img src="/maya-logo.png" alt="PayMaya" class="w-6 h-6" />' :
                                        '<div class="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center"><span class="text-white text-xs font-bold">₮</span></div>'}
                                    </div>
                                    <div>
                                      <div class="font-medium">${method.name}</div>
                                      <div class="text-sm text-gray-500">Balance: ₱${method.balance.toFixed(2)}</div>
                                    </div>
                                  </div>
                                  <div class="flex items-center space-x-2">
                                    ${method.isDefault ? '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Default</span>' :
                                      `<button class="set-default text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200" data-method="${method.id}">Set Default</button>`}
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                            <div class="mt-4 pt-4 border-t">
                              <button class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                                Add Payment Method
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                      document.body.appendChild(dialog);

                      // Add event listeners
                      dialog.querySelector('.close-dialog')?.addEventListener('click', () => {
                        document.body.removeChild(dialog);
                      });

                      dialog.addEventListener('click', (e) => {
                        if (e.target === dialog.firstElementChild) {
                          document.body.removeChild(dialog);
                        }
                      });

                      dialog.querySelectorAll('.set-default').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                          const methodId = (e.target as HTMLElement).dataset.method;
                          if (methodId) {
                            handleSetDefaultPayment(methodId);
                            document.body.removeChild(dialog);
                          }
                        });
                      });
                    }}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Button>
                  </div>
                </div>
              </div>

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
