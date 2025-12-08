'use client';

import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { EmotionType } from '@/types';
import { getEmotionColor, getEmotionEmoji } from '@/utils/emotionUtils';
import * as styles from './Alert.css';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  emotion?: EmotionType;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

import { themeVars } from '@/styles/theme.css';

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  title,
  message,
  severity = 'info',
  emotion,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return themeVars.colors.status.error;
      case 'warning':
        return themeVars.colors.status.warning;
      case 'success':
        return themeVars.colors.status.success;
      default:
        return themeVars.colors.status.info;
    }
  };

  const color = emotion ? getEmotionColor(emotion) : getSeverityColor();
  const emoji = emotion ? getEmotionEmoji(emotion) : null;

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.overlay} />
        <AlertDialog.Content className={styles.content}>
          <div className={styles.header} style={{ borderLeftColor: color }}>
            {emoji && <span className={styles.emoji}>{emoji}</span>}
            <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
          </div>
          <AlertDialog.Description className={styles.description}>
            {message}
          </AlertDialog.Description>
          <div className={styles.actions}>
            {onConfirm && (
              <AlertDialog.Cancel asChild>
                <button className={styles.cancelButton}>{cancelText}</button>
              </AlertDialog.Cancel>
            )}
            <AlertDialog.Action asChild>
              <button
                className={styles.confirmButton}
                style={{ backgroundColor: color }}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

