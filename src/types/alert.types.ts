/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

/**
 * Action button configuration for alerts
 */
export interface AlertAction {
  label: string;
  onClick: () => void;
}

/**
 * Alert data structure
 */
export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  title?: string;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  action?: AlertAction;
  createdAt: number; // timestamp for duplicate detection
}

/**
 * Alert context value
 */
export interface AlertContextValue {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
}

/**
 * Default alert duration (5 seconds)
 */
export const DEFAULT_ALERT_DURATION = 5000;

/**
 * Maximum number of visible alerts
 */
export const MAX_VISIBLE_ALERTS = 5;

/**
 * Duplicate detection window (3 seconds)
 */
export const DUPLICATE_DETECTION_WINDOW = 3000;

