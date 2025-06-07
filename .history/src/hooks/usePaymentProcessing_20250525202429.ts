"use client";

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { processPayment, formatCurrency } from '@/lib/paymentUtils';
import type { PaymentMethod, PaymentProcessingState, PaymentTransaction } from '@/types';

export interface UsePaymentProcessingReturn {
  paymentState: PaymentProcessingState;
  processPaymentMethod: (amount: number, paymentMethod: PaymentMethod) => Promise<PaymentTransaction | null>;
  resetPaymentState: () => void;
  isProcessing: boolean;
}

export const usePaymentProcessing = (): UsePaymentProcessingReturn => {
  const { toast } = useToast();
  const { paymentMethods, updatePaymentMethods } = useUser();
  
  const [paymentState, setPaymentState] = React.useState<PaymentProcessingState>({
    status: 'idle',
    transaction: null,
    error: null
  });

  const resetPaymentState = React.useCallback(() => {
    setPaymentState({
      status: 'idle',
      transaction: null,
      error: null
    });
  }, []);

  const updatePaymentMethodBalance = React.useCallback((
    methodId: string, 
    amount: number
  ) => {
    const updatedMethods = paymentMethods.map(method => {
      if (method.id === methodId && method.balance !== undefined) {
        return {
          ...method,
          balance: Math.max(0, method.balance - amount)
        };
      }
      return method;
    });
    updatePaymentMethods(updatedMethods);
  }, [paymentMethods, updatePaymentMethods]);

  const processPaymentMethod = React.useCallback(async (
    amount: number,
    paymentMethod: PaymentMethod
  ): Promise<PaymentTransaction | null> => {
    try {
      // Reset any previous state
      setPaymentState({
        status: 'processing',
        transaction: null,
        error: null
      });

      // Show processing toast
      toast({
        title: "Processing Payment",
        description: `Processing ${formatCurrency(amount)} via ${paymentMethod.name}...`,
      });

      // Process the payment
      const transaction = await processPayment(amount, paymentMethod);

      // Update state with transaction result
      setPaymentState({
        status: transaction.status,
        transaction,
        error: transaction.status === 'error' ? transaction.errorMessage || null : null
      });

      if (transaction.status === 'success') {
        // Update payment method balance
        updatePaymentMethodBalance(paymentMethod.id, amount);

        // Show success toast
        toast({
          title: "Payment Successful",
          description: `${formatCurrency(amount)} paid via ${paymentMethod.name}. Reference: ${transaction.referenceId}`,
        });

        // Auto-reset state after 3 seconds
        setTimeout(() => {
          resetPaymentState();
        }, 3000);

        return transaction;
      } else {
        // Show error toast
        toast({
          title: "Payment Failed",
          description: transaction.errorMessage || `Payment via ${paymentMethod.name} failed. Please try again.`,
          variant: "destructive"
        });

        // Auto-reset state after 5 seconds for errors
        setTimeout(() => {
          resetPaymentState();
        }, 5000);

        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      
      setPaymentState({
        status: 'error',
        transaction: null,
        error: errorMessage
      });

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });

      // Auto-reset state after 5 seconds for errors
      setTimeout(() => {
        resetPaymentState();
      }, 5000);

      return null;
    }
  }, [toast, updatePaymentMethodBalance, resetPaymentState]);

  const isProcessing = paymentState.status === 'processing';

  return {
    paymentState,
    processPaymentMethod,
    resetPaymentState,
    isProcessing
  };
};
