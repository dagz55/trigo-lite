'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, CreditCard, HeartHandshake, Shield, Sparkles, X, Zap } from "lucide-react";
import Link from 'next/link';
import * as React from 'react';

const premiumPlans = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    description: 'Standard TriGo experience',
    features: [
      { text: 'Book rides anytime', included: true },
      { text: 'Standard pickup times', included: true },
      { text: 'Basic support', included: true },
      { text: 'Priority booking', included: false },
      { text: 'Ride discounts', included: false },
      { text: 'Premium support 24/7', included: false },
      { text: 'Advance booking', included: false },
      { text: 'Loyalty rewards', included: false }
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    popular: false
  },
  {
    name: 'Premium',
    price: '₱199',
    period: '/month',
    description: 'Enhanced riding experience',
    features: [
      { text: 'Book rides anytime', included: true },
      { text: 'Priority pickup (5 min faster)', included: true },
      { text: 'Premium support 24/7', included: true },
      { text: 'Priority booking', included: true },
      { text: '10% ride discounts', included: true },
      { text: 'Advance booking up to 3 days', included: true },
      { text: 'Monthly ride reports', included: true },
      { text: 'Exclusive loyalty rewards', included: false }
    ],
    buttonText: 'Get Premium',
    buttonVariant: 'default' as const,
    popular: true
  },
  {
    name: 'Business',
    price: '₱499',
    period: '/month',
    description: 'For frequent riders & businesses',
    features: [
      { text: 'Book rides anytime', included: true },
      { text: 'VIP priority pickup', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Priority booking', included: true },
      { text: '20% ride discounts', included: true },
      { text: 'Advance booking up to 7 days', included: true },
      { text: 'Detailed analytics & reports', included: true },
      { text: 'Premium loyalty rewards', included: true }
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'default' as const,
    popular: false
  }
];

const premiumBenefits = [
  {
    icon: Zap,
    title: 'Priority Pickup',
    description: 'Get matched with triders faster during peak hours'
  },
  {
    icon: CreditCard,
    title: 'Exclusive Discounts',
    description: 'Save up to 20% on every ride with premium discounts'
  },
  {
    icon: Clock,
    title: 'Advance Booking',
    description: 'Schedule your rides up to 7 days in advance'
  },
  {
    icon: Shield,
    title: 'Premium Support',
    description: '24/7 dedicated support for all your ride needs'
  },
  {
    icon: HeartHandshake,
    title: 'Loyalty Rewards',
    description: 'Earn points and redeem exclusive rewards'
  },
  {
    icon: Sparkles,
    title: 'VIP Treatment',
    description: 'Access to premium triders and vehicles'
  }
];

export default function PassengerPremiumPage() {
  const [selectedPlan, setSelectedPlan] = React.useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge className="mb-2" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Premium Features
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Upgrade Your Ride Experience</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join TriGo Premium and enjoy priority bookings, exclusive discounts, and VIP treatment on every ride.
          </p>
          <Link href="/passenger">
            <Button variant="outline">Back to Rides</Button>
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {premiumPlans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${plan.popular ? 'border-green-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.buttonVariant}
                  onClick={() => setSelectedPlan(plan.name)}
                  disabled={plan.name === 'Basic'}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Go Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Can I cancel my premium subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to enjoy premium benefits until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How do priority pickups work?</h3>
              <p className="text-gray-600">Premium members are prioritized in our matching system, reducing wait times by an average of 5 minutes during peak hours.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Are discounts applied automatically?</h3>
              <p className="text-gray-600">Yes, your premium discount is automatically applied to every ride. You'll see the discounted fare before confirming your booking.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Can I share my premium benefits?</h3>
              <p className="text-gray-600">Premium benefits are tied to your personal account and cannot be shared. Consider our Business plan for team features.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="text-center py-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
            <p className="text-xl mb-6 text-green-50">
              Join thousands of riders enjoying the premium TriGo experience
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                Compare Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
