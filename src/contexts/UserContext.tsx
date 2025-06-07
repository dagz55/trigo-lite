"use client";

import type { MockPassengerProfile, PassengerSettings, PaymentMethod } from '@/types';
import React from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutosaveState {
  status: AutosaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  totalRides: number;
}

interface UserContextType {
  currentUser: MockPassengerProfile | null;
  userProfile: UserProfile;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  autosave: AutosaveState;
  setCurrentUser: (user: MockPassengerProfile | null) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
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

const defaultUserProfile: UserProfile = {
  name: "Michelle Santos",
  email: "michelle.santos@email.com",
  phone: "+63 917 123 4567",
  address: "Talon Kuatro, Las Piñas City",
  rating: 4.8,
  totalRides: 127
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = React.useState<MockPassengerProfile | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile>(defaultUserProfile);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(defaultPaymentMethods);
  const [autosave, setAutosave] = React.useState<AutosaveState>({
    status: 'idle',
    lastSaved: null,
    error: null
  });

  // Debounced save timeout ref
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMounted = React.useRef(false); // Ref to track initial mount

  // Debounced save function
  const debouncedSave = React.useCallback(async (userData: MockPassengerProfile | null, profileData: UserProfile, paymentData: PaymentMethod[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving status immediately
    setAutosave(prev => ({ ...prev, status: 'saving', error: null }));

    // Debounce the actual save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (userData) {
          localStorage.setItem('triGoCurrentUser', JSON.stringify(userData));
        }
        localStorage.setItem('triGoUserProfile', JSON.stringify(profileData));
        localStorage.setItem('triGoPaymentMethods', JSON.stringify(paymentData));

        setAutosave({
          status: 'saved',
          lastSaved: new Date(),
          error: null
        });

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setAutosave(prev => ({ ...prev, status: 'idle' }));
        }, 2000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
        console.error("Failed to save data to localStorage:", error);
        setAutosave({
          status: 'error',
          lastSaved: null,
          error: errorMessage
        });
      }
    }, 500); // 500ms debounce delay
  }, []);

  // Load user data from localStorage on mount
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('triGoCurrentUser');
      const storedProfile = localStorage.getItem('triGoUserProfile');
      const storedPaymentMethods = localStorage.getItem('triGoPaymentMethods');

      if (storedUser) {
        const user = JSON.parse(storedUser) as MockPassengerProfile;
        setCurrentUser(user);
      }

      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as UserProfile;
        setUserProfile(profile);
      }

      if (storedPaymentMethods) {
        const methods = JSON.parse(storedPaymentMethods) as PaymentMethod[];
        setPaymentMethods(methods);
      }

      // Set initial last saved time if data exists
      if (storedUser || storedProfile || storedPaymentMethods) {
        setAutosave(prev => ({ ...prev, lastSaved: new Date() }));
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage:", error);
      setAutosave(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to load saved data'
      }));
    }
  }, []);

  // Auto-save user data and payment methods whenever they change
  React.useEffect(() => {
    if (isMounted.current) {
      // Only run on updates (currentUser or paymentMethods change), not on initial mount
      debouncedSave(currentUser, userProfile, paymentMethods);
    } else {
      isMounted.current = true;
    }
  }, [currentUser, paymentMethods, debouncedSave]); // userProfile is NOT in dependencies here

  const defaultPaymentMethod = React.useMemo(() => {
    return paymentMethods.find(method => method.isDefault) || null;
  }, [paymentMethods]);

  const updateUserProfile = React.useCallback((profileUpdates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profileUpdates }));
  }, []);

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

  const forceSave = React.useCallback(async () => {
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setAutosave(prev => ({ ...prev, status: 'saving', error: null }));

    try {
      if (currentUser) {
        localStorage.setItem('triGoCurrentUser', JSON.stringify(currentUser));
      }
      localStorage.setItem('triGoUserProfile', JSON.stringify(userProfile));
      localStorage.setItem('triGoPaymentMethods', JSON.stringify(paymentMethods));

      setAutosave({
        status: 'saved',
        lastSaved: new Date(),
        error: null
      });

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setAutosave(prev => ({ ...prev, status: 'idle' }));
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      console.error("Failed to force save data to localStorage:", error);
      setAutosave({
        status: 'error',
        lastSaved: null,
        error: errorMessage
      });
      throw error; // Re-throw for caller to handle
    }
  }, [currentUser, userProfile, paymentMethods]);

  const contextValue = React.useMemo(() => ({
    currentUser,
    userProfile,
    paymentMethods,
    defaultPaymentMethod,
    autosave,
    setCurrentUser,
    updateUserProfile,
    updatePaymentMethods,
    setDefaultPaymentMethod,
    addPaymentMethod,
    removePaymentMethod,
    updateUserSettings,
    forceSave,
  }), [
    currentUser,
    userProfile,
    paymentMethods,
    defaultPaymentMethod,
    autosave,
    updateUserProfile,
    updatePaymentMethods,
    setDefaultPaymentMethod,
    addPaymentMethod,
    removePaymentMethod,
    updateUserSettings,
    forceSave,
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
