"use client";

import BottomNavBar from '@/components/passenger/BottomNavBar';
import { getPaymentIcon } from "@/components/PaymentIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, CreditCard, MapPin, Phone, Plus, Settings, Star, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

// Additional imports for payment processing

export default function PassengerProfilePage() {
  const { toast } = useToast();
  const { paymentMethods, setDefaultPaymentMethod, autosave, forceSave } = useUser();
  // const { paymentState, processPaymentMethod, isProcessing } = usePaymentProcessing();

  const [profile, setProfile] = React.useState({
    name: "Michelle Santos",
    email: "michelle.santos@email.com",
    phone: "+63 917 123 4567",
    address: "Talon Kuatro, Las Piñas City",
    rating: 4.8,
    totalRides: 127
  });

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

  // Payment processing handler for testing payment methods
  const handleTestPayment = React.useCallback(async (paymentMethod: PaymentMethod) => {
    // Temporarily disabled - will be implemented with proper payment processing
    toast({
      title: "Payment Test",
      description: `Testing ${paymentMethod.name} payment functionality - Coming soon!`,
    });
  }, [toast]);

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

  // Apple-style Payment Selector Component
  const AppleStylePaymentSelector = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedMethod = paymentMethods.find((method: PaymentMethod) => method.isDefault) || null;

    return (
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 ease-out"
        >
          <div className="flex items-center space-x-3">
            {selectedMethod ? (
              <>
                <div className="w-8 h-8 flex items-center justify-center">
                  {getPaymentIcon(selectedMethod)}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{selectedMethod.name}</div>
                  <div className="text-sm text-gray-500">
                    Balance: ₱{selectedMethod.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">?</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-500">Select Payment Method</div>
                  <div className="text-sm text-gray-400">Choose your preferred method</div>
                </div>
              </>
            )}
          </div>

          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="py-2">
              {paymentMethods.map((method, index) => (
                <div
                  key={method.id}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ease-out"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={() => handleTestPayment(method)}
                      title={`Test ${method.name} payment`}
                    >
                      {getPaymentIcon(method)}
                    </div>
                    <div
                      className="text-left cursor-pointer flex-1"
                      onClick={() => {
                        handleSetDefaultPayment(method.id);
                        setIsOpen(false);
                      }}
                    >
                      <div className="font-semibold text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">
                        Balance: ₱{method.balance?.toFixed(2) || '0.00'}
                        <span className="ml-2 text-xs text-purple-600 cursor-pointer hover:underline">
                          Click icon to test payment
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                    {selectedMethod?.id === method.id && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Payment Method Option */}
            <div className="border-t border-gray-100">
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors duration-150"
                onClick={() => {
                  setIsOpen(false);
                  toast({
                    title: "Add Payment Method",
                    description: "This feature will allow you to add new payment methods.",
                  });
                }}
              >
                <span className="font-medium">+ Add Payment Method</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
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

          {/* Autosave Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border mb-4">
            <div className="flex items-center space-x-2">
              {autosave.status === 'saving' && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-blue-600">Saving...</span>
                </>
              )}
              {autosave.status === 'saved' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {autosave.lastSaved ? `Saved ${formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}` : 'Saved'}
                  </span>
                </>
              )}
              {autosave.status === 'error' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {autosave.error || 'Save failed'}
                  </span>
                </>
              )}
              {autosave.status === 'idle' && (
                <>
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-500">
                    {autosave.lastSaved ? `Last saved ${formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}` : 'Ready'}
                  </span>
                </>
              )}
            </div>

            {autosave.status !== 'saving' && (
              <button
                type="button"
                onClick={forceSave}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Save Now
              </button>
            )}
          </div>

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

          {/* Payment Method Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppleStylePaymentSelector />
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
