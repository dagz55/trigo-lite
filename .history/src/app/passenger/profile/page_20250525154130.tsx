"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { getPaymentIcon } from "@/lib/paymentUtils";
import { ArrowLeft, CreditCard, MapPin, Phone, Plus, Settings, Star, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function PassengerProfilePage() {
  const { toast } = useToast();
  const { paymentMethods, setDefaultPaymentMethod } = useUser();

  const [profile, setProfile] = React.useState({
    name: "Michelle Santos",
    email: "michelle.santos@email.com",
    phone: "+63 917 123 4567",
    address: "Talon Kuatro, Las Piñas City",
    rating: 4.8,
    totalRides: 127
  });

  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [showAddressesDialog, setShowAddressesDialog] = React.useState(false);
  const [showContactsDialog, setShowContactsDialog] = React.useState(false);

  const [savedAddresses, setSavedAddresses] = React.useState([
    { id: 'home', label: 'Home', address: 'Talon Kuatro, Las Piñas City', isDefault: true },
    { id: 'work', label: 'Work', address: 'Alabang, Muntinlupa City', isDefault: false },
    { id: 'school', label: 'School', address: 'University of the Philippines, Diliman', isDefault: false }
  ]);

  const [emergencyContacts, setEmergencyContacts] = React.useState([
    { id: 'mom', name: 'Maria Santos', relationship: 'Mother', phone: '+63 917 123 4567', isPrimary: true },
    { id: 'dad', name: 'Jose Santos', relationship: 'Father', phone: '+63 918 234 5678', isPrimary: false },
    { id: 'sister', name: 'Ana Santos', relationship: 'Sister', phone: '+63 919 345 6789', isPrimary: false }
  ]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSetDefaultPayment = (methodId: string) => {
    setDefaultPaymentMethod(methodId);
    const method = paymentMethods.find((m: PaymentMethod) => m.id === methodId);
    toast({
      title: "Default Payment Updated",
      description: `${method?.name} is now your default payment method.`,
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setSavedAddresses(prev => prev.map(address => ({
      ...address,
      isDefault: address.id === addressId
    })));
    const address = savedAddresses.find(a => a.id === addressId);
    toast({
      title: "Default Address Updated",
      description: `${address?.label} is now your default address.`,
    });
  };

  const handleSetPrimaryContact = (contactId: string) => {
    setEmergencyContacts(prev => prev.map(contact => ({
      ...contact,
      isPrimary: contact.id === contactId
    })));
    const contact = emergencyContacts.find(c => c.id === contactId);
    toast({
      title: "Primary Contact Updated",
      description: `${contact?.name} is now your primary emergency contact.`,
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
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowPaymentDialog(true)}
              >
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </div>
                <div className="flex items-center">
                  {(() => {
                    const defaultMethod = paymentMethods.find((method: PaymentMethod) => method.isDefault);
                    return defaultMethod ? (
                      <div className="w-5 h-5">
                        {getPaymentIcon(defaultMethod)}
                      </div>
                    ) : null;
                  })()}
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowAddressesDialog(true)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Saved Addresses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowContactsDialog(true)}
              >
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

      {/* Payment Methods Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Payment Methods</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPaymentDialog(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    method.isDefault ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="payment-icon">
                      {getPaymentIcon(method)}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-500">Balance: ₱{method.balance.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault ? (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Default
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => {
                          handleSetDefaultPayment(method.id);
                          setShowPaymentDialog(false);
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  toast({
                    title: "Add Payment Method",
                    description: "This feature will allow you to add new payment methods.",
                  });
                  setShowPaymentDialog(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Dialog */}
      {showAddressesDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddressesDialog(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-3">
              {savedAddresses.map(address => (
                <div
                  key={address.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    address.isDefault ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{address.label}</div>
                      <div className="text-sm text-gray-500">{address.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {address.isDefault ? (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Default
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => {
                          handleSetDefaultAddress(address.id);
                          setShowAddressesDialog(false);
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  toast({
                    title: "Add Address",
                    description: "This feature will allow you to add new saved addresses.",
                  });
                  setShowAddressesDialog(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Dialog */}
      {showContactsDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Emergency Contacts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactsDialog(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-3">
              {emergencyContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    contact.isPrimary ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.relationship} • {contact.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contact.isPrimary ? (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Primary
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => {
                          handleSetPrimaryContact(contact.id);
                          setShowContactsDialog(false);
                        }}
                      >
                        Set Primary
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  toast({
                    title: "Add Contact",
                    description: "This feature will allow you to add new emergency contacts.",
                  });
                  setShowContactsDialog(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Emergency Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
