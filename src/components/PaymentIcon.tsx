"use client";

import React from 'react';
import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentIconProps {
  method: PaymentMethod | string;
  className?: string;
}

export const PaymentIcon: React.FC<PaymentIconProps> = ({ method, className = "w-6 h-6" }) => {
  const methodId = typeof method === 'string' ? method : method.id;
  
  switch (methodId) {
    case 'gcash':
      return <img src="/GCash.png" alt="GCash" className={className} />;
    case 'paymaya':
      return <img src="/maya-logo.png" alt="PayMaya" className={className} />;
    case 'tricoin':
      return (
        <div className={`${className} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">₮</span>
        </div>
      );
    default:
      return <CreditCard className={className} />;
  }
};

// Legacy function for backward compatibility
export const getPaymentIcon = (method: PaymentMethod | string) => {
  return <PaymentIcon method={method} />;
};

export default PaymentIcon;
