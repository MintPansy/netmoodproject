import { style, keyframes } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const container = style({
  border: `2px dashed ${themeVars.colors.border.default}`,
  borderRadius: themeVars.borderRadius.lg,
  padding: themeVars.spacing['2xl'],
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: themeVars.colors.bg.primary,
  ':hover': {
    borderColor: themeVars.colors.status.info,
    backgroundColor: themeVars.colors.bg.secondary,
  },
});

export const dragging = style({
  borderColor: themeVars.colors.status.info,
  backgroundColor: themeVars.colors.bg.secondary,
  transform: 'scale(1.02)',
});

export const uploading = style({
  borderColor: themeVars.colors.status.info,
  backgroundColor: themeVars.colors.bg.secondary,
  cursor: 'not-allowed',
});

export const input = style({
  display: 'none',
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: themeVars.spacing.md,
});

export const icon = style({
  fontSize: '3rem',
  marginBottom: themeVars.spacing.sm,
});

export const text = style({
  fontSize: themeVars.fontSize.lg,
  fontWeight: themeVars.fontWeight.semibold,
  color: themeVars.colors.text.primary,
  margin: 0,
});

export const subtext = style({
  fontSize: themeVars.fontSize.sm,
  color: themeVars.colors.text.secondary,
  margin: 0,
});

export const spinner = style({
  width: '40px',
  height: '40px',
  border: `4px solid ${themeVars.colors.border.light}`,
  borderTopColor: themeVars.colors.status.info,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

// AlertDialog 스타일
export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
});

export const dialogContent = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: themeVars.colors.bg.primary,
  borderRadius: themeVars.borderRadius.lg,
  padding: themeVars.spacing.xl,
  boxShadow: themeVars.shadows.xl,
  zIndex: 1001,
  minWidth: '400px',
  maxWidth: '90vw',
});

export const dialogTitle = style({
  fontSize: themeVars.fontSize.xl,
  fontWeight: themeVars.fontWeight.bold,
  color: themeVars.colors.text.primary,
  marginBottom: themeVars.spacing.md,
});

export const dialogDescription = style({
  fontSize: themeVars.fontSize.base,
  color: themeVars.colors.text.secondary,
  marginBottom: themeVars.spacing.lg,
  lineHeight: 1.6,
});

export const dialogActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: themeVars.spacing.md,
});

export const dialogButton = style({
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.lg}`,
  fontSize: themeVars.fontSize.base,
  fontWeight: themeVars.fontWeight.semibold,
  color: '#fff',
  backgroundColor: themeVars.colors.status.info,
  border: 'none',
  borderRadius: themeVars.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: '#2563eb',
  },
});

