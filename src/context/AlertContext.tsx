import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { Alert, AlertContextValue, AlertSeverity } from '../types/alert.types';
import {
  DEFAULT_ALERT_DURATION,
  MAX_VISIBLE_ALERTS,
  DUPLICATE_DETECTION_WINDOW,
} from '../types/alert.types';

/**
 * AlertContext - Global state management for alerts
 */
const AlertContext = createContext<AlertContextValue | undefined>(undefined);

/**
 * AlertProvider - Provider component that wraps the app
 */
interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastAlertRef = useRef<Map<string, number>>(new Map());

  /**
   * Generate unique ID for alert
   */
  const generateId = useCallback((): string => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Check if alert is duplicate within the detection window
   */
  const isDuplicate = useCallback(
    (message: string, severity: AlertSeverity): boolean => {
      const key = `${severity}-${message}`;
      const lastTime = lastAlertRef.current.get(key);
      const now = Date.now();

      if (lastTime && now - lastTime < DUPLICATE_DETECTION_WINDOW) {
        return true;
      }

      lastAlertRef.current.set(key, now);
      return false;
    },
    []
  );

  /**
   * Remove alert by ID
   */
  const removeAlert = useCallback((id: string) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  /**
   * Add alert with auto-dismiss and stack management
   */
  const addAlert = useCallback(
    (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
      // Prevent duplicates
      if (isDuplicate(alertData.message, alertData.severity)) {
        return;
      }

      const id = generateId();
      const duration = alertData.duration ?? DEFAULT_ALERT_DURATION;
      const createdAt = Date.now();

      const newAlert: Alert = {
        ...alertData,
        id,
        createdAt,
        // Auto-dismiss disabled for errors (duration 0)
        duration: alertData.severity === 'error' ? 0 : duration,
      };

      setAlerts((prev) => {
        // FIFO removal: remove oldest if max reached
        const updated = [...prev, newAlert];
        if (updated.length > MAX_VISIBLE_ALERTS) {
          const removed = updated.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return updated;
      });

      // Set auto-dismiss timer (only if duration > 0)
      if (newAlert.duration && newAlert.duration > 0) {
        const timer = setTimeout(() => {
          removeAlert(id);
        }, newAlert.duration);

        timersRef.current.set(id, timer);
      }
    },
    [generateId, isDuplicate, removeAlert]
  );

  /**
   * Clear all alerts
   */
  const clearAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setAlerts([]);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value: AlertContextValue = {
    alerts,
    addAlert,
    removeAlert,
    clearAll,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

/**
 * Hook to access AlertContext
 * @throws Error if used outside AlertProvider
 */
export const useAlertContext = (): AlertContextValue => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
};

