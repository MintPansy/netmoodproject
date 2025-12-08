import React, { useEffect, useRef, useState } from 'react';
import type { Alert } from '../types/alert.types';
import './Alert.css';

interface AlertProps {
  alert: Alert;
  onClose: (id: string) => void;
}

/**
 * Get icon based on severity
 */
const getSeverityIcon = (severity: Alert['severity']): string => {
  switch (severity) {
    case 'info':
      return 'ℹ️';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'success':
      return '✅';
    default:
      return 'ℹ️';
  }
};

/**
 * Individual Alert component
 * Displays icon, title, message, close button, progress bar, and action button
 */
export const AlertComponent: React.FC<AlertProps> = ({ alert, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Fade-in animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (!alert.duration || alert.duration === 0) {
      return;
    }

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / alert.duration!) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    };

    progressIntervalRef.current = setInterval(updateProgress, 50);
    startTimeRef.current = Date.now();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [alert.duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation before removing
    setTimeout(() => {
      onClose(alert.id);
    }, 300);
  };

  const handleActionClick = () => {
    if (alert.action) {
      alert.action.onClick();
      handleClose();
    }
  };

  const icon = getSeverityIcon(alert.severity);
  const showProgressBar = alert.duration && alert.duration > 0;

  return (
    <div
      className={`alert alert--${alert.severity} ${isVisible ? 'alert--visible' : ''}`}
      role="alert"
      aria-live={alert.severity === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="alert__content">
        <div className="alert__icon" aria-hidden="true">
          {icon}
        </div>
        <div className="alert__body">
          {alert.title && (
            <h3 className="alert__title" id={`alert-title-${alert.id}`}>
              {alert.title}
            </h3>
          )}
          <p className="alert__message" id={`alert-message-${alert.id}`}>
            {alert.message}
          </p>
          {alert.action && (
            <button
              className="alert__action"
              onClick={handleActionClick}
              aria-describedby={`alert-message-${alert.id}`}
            >
              {alert.action.label}
            </button>
          )}
        </div>
        <button
          className="alert__close"
          onClick={handleClose}
          aria-label={`Close alert: ${alert.title || alert.message}`}
          aria-describedby={`alert-message-${alert.id}`}
        >
          ×
        </button>
      </div>
      {showProgressBar && (
        <div className="alert__progress-container" aria-hidden="true">
          <div
            className="alert__progress-bar"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
};

