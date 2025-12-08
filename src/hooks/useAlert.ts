import { useAlertContext } from '../context/AlertContext';
import type { AlertSeverity, AlertAction } from '../types/alert.types';

/**
 * Options for adding an alert
 */
export interface AddAlertOptions {
  severity: AlertSeverity;
  message: string;
  title?: string;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  action?: AlertAction;
}

/**
 * Custom hook for triggering alerts
 * 
 * @example
 * ```tsx
 * const { addAlert } = useAlert();
 * 
 * addAlert({
 *   severity: 'error',
 *   title: 'Network Anomaly Detected',
 *   message: 'Unusual traffic pattern identified in port 443',
 *   duration: 0, // Don't auto-dismiss
 *   action: { label: 'View Details', onClick: () => {...} }
 * });
 * ```
 */
export const useAlert = () => {
  const { addAlert, removeAlert, clearAll } = useAlertContext();

  return {
    /**
     * Add a new alert
     */
    addAlert: (options: AddAlertOptions) => {
      addAlert({
        severity: options.severity,
        message: options.message,
        title: options.title,
        duration: options.duration,
        action: options.action,
      });
    },
    /**
     * Remove an alert by ID
     */
    removeAlert,
    /**
     * Clear all alerts
     */
    clearAll,
  };
};

