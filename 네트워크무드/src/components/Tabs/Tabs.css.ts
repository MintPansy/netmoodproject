import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const root = style({
  width: '100%',
});

export const list = style({
  display: 'flex',
  borderBottom: `2px solid ${themeVars.colors.border.light}`,
  marginBottom: themeVars.spacing.lg,
  gap: themeVars.spacing.xs,
});

export const trigger = style({
  padding: `${themeVars.spacing.md} ${themeVars.spacing.lg}`,
  fontSize: themeVars.fontSize.base,
  fontWeight: themeVars.fontWeight.medium,
  color: themeVars.colors.text.secondary,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `2px solid transparent`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  bottom: '-2px',
  ':hover': {
    color: themeVars.colors.text.primary,
    backgroundColor: themeVars.colors.bg.secondary,
  },
  selectors: {
    '&[data-state="active"]': {
      color: themeVars.colors.status.info,
      borderBottomColor: themeVars.colors.status.info,
      fontWeight: themeVars.fontWeight.semibold,
    },
  },
});

export const content = style({
  padding: themeVars.spacing.lg,
  animation: 'fadeIn 0.2s ease',
  '@media': {
    '(max-width: 768px)': {
      padding: themeVars.spacing.md,
    },
  },
});

