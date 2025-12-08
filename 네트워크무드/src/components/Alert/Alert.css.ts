import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease',
});

export const content = style({
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
  animation: 'slideIn 0.2s ease',
  '@media': {
    '(max-width: 768px)': {
      minWidth: '90vw',
      padding: themeVars.spacing.lg,
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeVars.spacing.md,
  marginBottom: themeVars.spacing.lg,
  paddingLeft: themeVars.spacing.md,
  borderLeft: `4px solid ${themeVars.colors.status.info}`,
});

export const emoji = style({
  fontSize: '2rem',
});

export const title = style({
  fontSize: themeVars.fontSize.xl,
  fontWeight: themeVars.fontWeight.bold,
  color: themeVars.colors.text.primary,
  margin: 0,
});

export const description = style({
  fontSize: themeVars.fontSize.base,
  color: themeVars.colors.text.secondary,
  marginBottom: themeVars.spacing.lg,
  lineHeight: 1.6,
});

export const actions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: themeVars.spacing.md,
});

export const confirmButton = style({
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.lg}`,
  fontSize: themeVars.fontSize.base,
  fontWeight: themeVars.fontWeight.semibold,
  color: '#fff',
  border: 'none',
  borderRadius: themeVars.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    opacity: 0.9,
    transform: 'translateY(-1px)',
  },
});

export const cancelButton = style({
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.lg}`,
  fontSize: themeVars.fontSize.base,
  fontWeight: themeVars.fontWeight.medium,
  color: themeVars.colors.text.secondary,
  backgroundColor: 'transparent',
  border: `1px solid ${themeVars.colors.border.default}`,
  borderRadius: themeVars.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: themeVars.colors.bg.secondary,
    borderColor: themeVars.colors.border.default,
  },
});

