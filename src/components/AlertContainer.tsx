import React from 'react';
import { useAlertContext } from '../context/AlertContext';
import { AlertComponent } from './Alert';
import './AlertContainer.css';

/**
 * AlertContainer - Displays all active alerts
 * Positioned fixed bottom-right with z-index 9999
 */
export const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useAlertContext();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div
      className="alert-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {alerts.map((alert) => (
        <AlertComponent key={alert.id} alert={alert} onClose={removeAlert} />
      ))}
    </div>
  );
};

