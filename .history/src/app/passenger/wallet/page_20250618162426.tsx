'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowDownLeft, ArrowUpRight, Building2, Clock, CreditCard, Plus, Smartphone, Wallet as WalletIcon } from "lucide-react";
import Link from 'next/link';
import * as React from 'react';

// Mock data for demonstration
const mockWalletData = {
  balance: 1250.50,
  lastTopUp: '2024-01-10',
  totalTopUps: 15,
  totalSpent: 2450.00,
  savedCards: [
    {
      id: 'card-1',
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 'card-2',
      type: 'mastercard',
      last4: '5555',
      expiry: '06/26',
      isDefault: false
    }
  ]
};

const mockTransactionHistory = [
  {
    id: 'trans-1',
    type: 'payment',
    description: 'Ride to SM Southmall',
    amount: -85.00,
    date: '2024-01-15',
    time: '14:35',
    status: 'completed'
  },
  {
    id: 'trans-2',
    type: 'topup',
    description: 'Top up via Visa ****4242',
    amount: 500.00,
    date: '2024-01-14',
    time: '10:20',
    status: 'completed'
  },
  {
    id: 'trans-3',
    type: 'payment',
    description: 'Ride to Festival Mall',
    amount: -120.00,
    date: '2024-01-14',
    time: '09:20',
    status: 'completed'
  },
  {
    id: 'trans-4',
    type: 'payment',
    description: 'Ride to Starmall Las Piñas',
    amount: -65.00,
    date: '2024-01-13',
    time: '18:50',
    status: 'completed'
  },
  {
    id: 'trans-5',
    type: 'topup',
    description: 'Top up via GCash',
    amount: 1000.00,
    date: '2024-01-10',
    time: '08:15',
    status: 'completed'
  }
];

const paymentMethods = [
  { id: 'gcash', name: 'GCash', icon: Smartphone, available: true },
  { id: 'maya', name: 'Maya', icon: Smartphone, available: true },
  { id: 'bank', name: 'Bank Transfer', icon: Building2, available: true },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, available: true }
];

export default function PassengerWalletPage() {
  const [topUpAmount, setTopUpAmount] = React.useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('');
  const [showPayMongoDialog, setShowPayMongoDialog] = React.useState(false);
  const [walletBalance, setWalletBalance] = React.useState(mockWalletData.balance);
  const { toast } = useToast();

  const handleTopUp = () => {
    // Mock top-up action
    console.log('Top up amount:', topUpAmount, 'via', selectedPaymentMethod);
  };

  const handlePayMongoSuccess = (amount: number, referenceNumber: string) => {
    // In a real app, this would be triggered by the webhook
    // For demo purposes, we'll simulate a successful top-up
    toast({
      title: "Top-up Initiated",
      description: `Reference: ${referenceNumber}. Amount will be credited after payment confirmation.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600">Manage your TriGo wallet and payments</p>
          </div>
          <Link href="/passenger">
            <Button variant="outline">Back to Rides</Button>
          </Link>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Wallet Balance</span>
              <WalletIcon className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">₱{walletBalance.toFixed(2)}</div>
            <p className="text-green-100 text-sm">Last top up: {new Date(mockWalletData.lastTopUp).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Top Ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockWalletData.totalTopUps}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{mockWalletData.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">On rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(mockWalletData.totalSpent / 31).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per ride</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Top Up and History */}
        <Tabs defaultValue="topup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="cards">Payment Methods</TabsTrigger>
          </TabsList>

          {/* Top Up Tab */}
          <TabsContent value="topup">
            <Card>
              <CardHeader>
                <CardTitle>Add Money to Wallet</CardTitle>
                <CardDescription>Choose amount and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₱)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="50"
                    step="50"
                  />
                  <div className="flex gap-2 mt-2">
                    {[100, 300, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopUpAmount(amount.toString())}
                      >
                        ₱{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                        className="h-auto p-4 justify-start"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        disabled={!method.available}
                      >
                        <method.icon className="mr-2 h-5 w-5" />
                        <span>{method.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleTopUp}
                  disabled={!topUpAmount || !selectedPaymentMethod}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Top Up Wallet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactionHistory.map((transaction, index) => (
                    <div key={transaction.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'topup' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'topup' ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(transaction.date).toLocaleDateString()} at {transaction.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      {index < mockTransactionHistory.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">View All Transactions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>Saved Payment Methods</CardTitle>
                <CardDescription>Manage your cards and payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWalletData.savedCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {card.type.charAt(0).toUpperCase() + card.type.slice(1)} ****{card.last4}
                          </p>
                          <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {card.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button variant="ghost" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
