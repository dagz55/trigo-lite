
"use client";

import type { AppSettings, Coordinates, ThemeSetting } from '@/types';
import React, { useState, useEffect, useCallback, useMemo, useContext, createContext } from 'react';

const LAS_PINAS_CENTER_DEFAULT: Coordinates = { latitude: 14.4445, longitude: 120.9938 };
const DEFAULT_ZOOM = 12.5;
const DEFAULT_RIDE_REQUEST_INTERVAL = 30000; // 30 seconds
const DEFAULT_TRIDER_UPDATE_INTERVAL = 5000;  // 5 seconds
const DEFAULT_AI_INSIGHT_INTERVAL = 60000; // 60 seconds
const DEFAULT_CONVENIENCE_FEE = 1.00; // Default ₱1.00
export const DEFAULT_TODA_BASE_FARE_FALLBACK = 20.00; 
const DEFAULT_GLOBAL_BASE_FARE = 20.00; 
const DEFAULT_PER_KM_CHARGE = 5.00; 

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultMapZoom: DEFAULT_ZOOM,
  defaultMapCenter: LAS_PINAS_CENTER_DEFAULT,
  showHeatmap: true,
  rideRequestIntervalMs: DEFAULT_RIDE_REQUEST_INTERVAL,
  triderUpdateIntervalMs: DEFAULT_TRIDER_UPDATE_INTERVAL,
  aiInsightIntervalMs: DEFAULT_AI_INSIGHT_INTERVAL,
  convenienceFee: DEFAULT_CONVENIENCE_FEE,
  todaBaseFares: {}, 
  defaultBaseFare: DEFAULT_GLOBAL_BASE_FARE,
  perKmCharge: DEFAULT_PER_KM_CHARGE,
  todaTerminalExitPoints: {
    'ALABANG_ZAPOTE_EXIT': { point: { latitude: 14.4167, longitude: 121.0000 }, address: 'Alabang-Zapote Road Exit' },
  },
};

interface SettingsContextType extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  isLoading: boolean;
  getTodaBaseFare: (todaZoneId: string) => number;
  getTodaTerminalExitPoint: (todaZoneId: string) => { point: Coordinates; address: string } | undefined;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('triGoAppSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Partial<AppSettings>;
        setSettings(prev => ({ 
          ...defaultSettings, 
          ...prev, 
          ...parsedSettings,
          todaBaseFares: parsedSettings.todaBaseFares || {},
          convenienceFee: parsedSettings.convenienceFee ?? DEFAULT_CONVENIENCE_FEE,
          defaultBaseFare: parsedSettings.defaultBaseFare ?? DEFAULT_GLOBAL_BASE_FARE,
          perKmCharge: parsedSettings.perKmCharge ?? DEFAULT_PER_KM_CHARGE,
          todaTerminalExitPoints: parsedSettings.todaTerminalExitPoints || {},
        }));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(defaultSettings); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return; 

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = settings.theme;
    if (settings.theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.classList.add(effectiveTheme);
    
    try {
        localStorage.setItem('triGoAppSettings', JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
    }

  }, [settings, isLoading]);

  useEffect(() => {
    if (settings.theme !== 'system' || isLoading) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, isLoading]);


  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('triGoAppSettings');
    } catch (error) {
      console.error("Failed to remove settings from localStorage:", error);
    }
  }, []);

  const getTodaBaseFare = useCallback((todaZoneId: string): number => {
    return settings.todaBaseFares[todaZoneId] ?? settings.defaultBaseFare ?? DEFAULT_TODA_BASE_FARE_FALLBACK;
  }, [settings.todaBaseFares, settings.defaultBaseFare]);

  const getTodaTerminalExitPoint = useCallback((todaZoneId: string): { point: Coordinates; address: string } | undefined => {
    return settings.todaTerminalExitPoints[todaZoneId];
  }, [settings.todaTerminalExitPoints]);

  const contextValue = useMemo(() => ({
    ...settings,
    updateSetting,
    resetSettings,
    isLoading,
    getTodaBaseFare,
    getTodaTerminalExitPoint,
  }), [settings, isLoading, updateSetting, resetSettings, getTodaBaseFare, getTodaTerminalExitPoint]);


  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
