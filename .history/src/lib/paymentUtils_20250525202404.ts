"use client";

import React from 'react';
import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '@/types';

// Payment processing status types
export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface PaymentTransaction {
  id: string;
  amount: number;
  paymentMethodId: string;
  status: PaymentStatus;
  timestamp: Date;
  referenceId?: string;
  errorMessage?: string;
}

export interface PaymentProcessingState {
  status: PaymentStatus;
  transaction: PaymentTransaction | null;
  error: string | null;
}

// Payment method icons
export const getPaymentIcon = (method: PaymentMethod | string) => {
  const methodId = typeof method === 'string' ? method : method.id;
  
  switch (methodId) {
    case 'gcash':
      return <img src="/GCash.png" alt="GCash" className="w-6 h-6" />;
    case 'paymaya':
      return <img src="/maya-logo.png" alt="PayMaya" className="w-6 h-6" />;
    case 'tricoin':
      return (
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">₮</span>
        </div>
      );
    default:
      return <CreditCard className="w-6 h-6" />;
  }
};

// Generate unique transaction ID
const generateTransactionId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate reference ID for payment methods
const generateReferenceId = (methodId: string): string => {
  const prefix = methodId.toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Simulate network delay for realistic payment processing
const simulateNetworkDelay = (min: number = 1000, max: number = 3000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// GCash payment processing
export const processGCashPayment = async (
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentTransaction> => {
  const transaction: PaymentTransaction = {
    id: generateTransactionId(),
    amount,
    paymentMethodId: paymentMethod.id,
    status: 'processing',
    timestamp: new Date(),
    referenceId: generateReferenceId('GCASH')
  };

  try {
    // Simulate API call to GCash
    await simulateNetworkDelay(1500, 2500);
    
    // Check if user has sufficient balance
    if (paymentMethod.balance && paymentMethod.balance < amount) {
      throw new Error('Insufficient GCash balance');
    }

    // Simulate random failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('GCash service temporarily unavailable');
    }

    // Success
    return {
      ...transaction,
      status: 'success'
    };
  } catch (error) {
    return {
      ...transaction,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'GCash payment failed'
    };
  }
};

// Paymaya payment processing
export const processPaymayaPayment = async (
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentTransaction> => {
  const transaction: PaymentTransaction = {
    id: generateTransactionId(),
    amount,
    paymentMethodId: paymentMethod.id,
    status: 'processing',
    timestamp: new Date(),
    referenceId: generateReferenceId('MAYA')
  };

  try {
    // Simulate API call to Paymaya
    await simulateNetworkDelay(1200, 2800);
    
    // Check if user has sufficient balance
    if (paymentMethod.balance && paymentMethod.balance < amount) {
      throw new Error('Insufficient PayMaya balance');
    }

    // Simulate random failure (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('PayMaya service temporarily unavailable');
    }

    // Success
    return {
      ...transaction,
      status: 'success'
    };
  } catch (error) {
    return {
      ...transaction,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'PayMaya payment failed'
    };
  }
};

// TriCoin payment processing
export const processTriCoinPayment = async (
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentTransaction> => {
  const transaction: PaymentTransaction = {
    id: generateTransactionId(),
    amount,
    paymentMethodId: paymentMethod.id,
    status: 'processing',
    timestamp: new Date(),
    referenceId: generateReferenceId('TRICOIN')
  };

  try {
    // Simulate internal TriCoin processing
    await simulateNetworkDelay(800, 1500);
    
    // Check if user has sufficient TriCoin balance
    if (paymentMethod.balance && paymentMethod.balance < amount) {
      throw new Error('Insufficient TriCoin balance');
    }

    // TriCoin is more reliable (1% failure rate)
    if (Math.random() < 0.01) {
      throw new Error('TriCoin network congestion');
    }

    // Success
    return {
      ...transaction,
      status: 'success'
    };
  } catch (error) {
    return {
      ...transaction,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'TriCoin payment failed'
    };
  }
};

// Main payment processing function
export const processPayment = async (
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentTransaction> => {
  if (amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  switch (paymentMethod.id) {
    case 'gcash':
      return processGCashPayment(amount, paymentMethod);
    case 'paymaya':
      return processPaymayaPayment(amount, paymentMethod);
    case 'tricoin':
      return processTriCoinPayment(amount, paymentMethod);
    default:
      throw new Error(`Unsupported payment method: ${paymentMethod.name}`);
  }
};

// Validate payment method
export const validatePaymentMethod = (paymentMethod: PaymentMethod): boolean => {
  if (!paymentMethod.id || !paymentMethod.name) {
    return false;
  }
  
  // Check if payment method is supported
  const supportedMethods = ['gcash', 'paymaya', 'tricoin'];
  return supportedMethods.includes(paymentMethod.id);
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `₱${amount.toFixed(2)}`;
};

// Get payment method display name with balance
export const getPaymentMethodDisplayText = (method: PaymentMethod): string => {
  const balance = method.balance ? formatCurrency(method.balance) : 'N/A';
  return `${method.name} (${balance})`;
};
