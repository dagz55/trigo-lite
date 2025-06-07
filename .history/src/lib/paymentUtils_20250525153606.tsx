import React from 'react';
import Image from 'next/image';
import type { PaymentMethod } from '@/types';

export const getPaymentIcon = (method: PaymentMethod): React.ReactNode => {
  switch (method.id) {
    case 'gcash':
      return <Image src="/GCash.png" alt="GCash" width={24} height={24} className="w-6 h-6" />;
    case 'paymaya':
      return <Image src="/public/maya-logo.png" alt="PayMaya" width={24} height={24} className="w-6 h-6" />;
    case 'tricoin':
      return (
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">₮</span>
        </div>
      );
    case 'applepay':
      return (
        <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">🍎</span>
        </div>
      );
    case 'googlepay':
      return (
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">💳</span>
        </div>
      );
  }
};

export const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
  return method.name;
};

export const getPaymentMethodBalance = (method: PaymentMethod): string => {
  if (method.balance !== undefined) {
    return `₱${method.balance.toFixed(2)}`;
  }
  return 'N/A';
};
