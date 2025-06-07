"use client";

import type { MockPassengerProfile, PassengerSettings, PaymentMethod } from '@/types';
import React from 'react';

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveState {
  status: AutosaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

interface UserContextType {
  currentUser: MockPassengerProfile | null;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  autosave: AutosaveState;
  setCurrentUser: (user: MockPassengerProfile | null) => void;
  updatePaymentMethods: (methods: PaymentMethod[]) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (methodId: string) => void;
  updateUserSettings: (settings: Partial<PassengerSettings>) => void;
  forceSave: () => Promise<void>;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'gcash', name: 'GCash', type: 'ewallet', isDefault: true, balance: 1250.50 },
  { id: 'paymaya', name: 'PayMaya', type: 'ewallet', isDefault: false, balance: 850.25 },
  { id: 'tricoin', name: 'TriCoin', type: 'crypto', isDefault: false, balance: 45.75 }
];

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = React.useState<MockPassengerProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(defaultPaymentMethods);
  const [autosave, setAutosave] = React.useState<AutosaveState>({
    status: 'idle',
    lastSaved: null,
    error: null
  });

  // Debounced save timeout ref
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load user data from localStorage on mount
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('triGoCurrentUser');
      const storedPaymentMethods = localStorage.getItem('triGoPaymentMethods');

      if (storedUser) {
        const user = JSON.parse(storedUser) as MockPassengerProfile;
        setCurrentUser(user);
      }

      if (storedPaymentMethods) {
        const methods = JSON.parse(storedPaymentMethods) as PaymentMethod[];
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage:", error);
    }
  }, []);

  // Save user data to localStorage whenever it changes
  React.useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('triGoCurrentUser', JSON.stringify(currentUser));
      } catch (error) {
        console.error("Failed to save user data to localStorage:", error);
      }
    }
  }, [currentUser]);

  React.useEffect(() => {
    try {
      localStorage.setItem('triGoPaymentMethods', JSON.stringify(paymentMethods));
    } catch (error) {
      console.error("Failed to save payment methods to localStorage:", error);
    }
  }, [paymentMethods]);

  const defaultPaymentMethod = React.useMemo(() => {
    return paymentMethods.find(method => method.isDefault) || null;
  }, [paymentMethods]);

  const updatePaymentMethods = React.useCallback((methods: PaymentMethod[]) => {
    setPaymentMethods(methods);
  }, []);

  const setDefaultPaymentMethod = React.useCallback((methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));

    // Update user settings to reflect the new default payment method
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        settings: {
          mapStyle: prev.settings?.mapStyle || 'standard',
          ...prev.settings,
          defaultPaymentMethodId: methodId
        } as PassengerSettings
      } : null);
    }
  }, [currentUser]);

  const addPaymentMethod = React.useCallback((method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
  }, []);

  const removePaymentMethod = React.useCallback((methodId: string) => {
    setPaymentMethods(prev => {
      const filtered = prev.filter(method => method.id !== methodId);
      // If we removed the default payment method, set the first one as default
      if (prev.find(m => m.id === methodId)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  }, []);

  const updateUserSettings = React.useCallback((settings: Partial<PassengerSettings>) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      settings: {
        mapStyle: prev.settings?.mapStyle || 'standard',
        ...prev.settings,
        ...settings
      } as PassengerSettings
    } : null);
  }, []);

  const contextValue = React.useMemo(() => ({
    currentUser,
    paymentMethods,
    defaultPaymentMethod,
    setCurrentUser,
    updatePaymentMethods,
    setDefaultPaymentMethod,
    addPaymentMethod,
    removePaymentMethod,
    updateUserSettings,
  }), [
    currentUser,
    paymentMethods,
    defaultPaymentMethod,
    updatePaymentMethods,
    setDefaultPaymentMethod,
    addPaymentMethod,
    removePaymentMethod,
    updateUserSettings,
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
