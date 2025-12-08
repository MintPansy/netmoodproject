import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  gap: themeVars.spacing.xs,
  alignItems: 'center',
});

export const button = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeVars.spacing.xs,
  padding: `${themeVars.spacing.xs} ${themeVars.spacing.sm}`,
  fontSize: themeVars.fontSize.sm,
  fontWeight: themeVars.fontWeight.medium,
  color: themeVars.colors.text.secondary,
  backgroundColor: 'transparent',
  border: `1px solid ${themeVars.colors.border.default}`,
  borderRadius: themeVars.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: themeVars.colors.bg.secondary,
    borderColor: themeVars.colors.status.info,
    color: themeVars.colors.text.primary,
  },
});

export const active = style({
  backgroundColor: themeVars.colors.status.info,
  color: '#fff',
  borderColor: themeVars.colors.status.info,
  ':hover': {
    backgroundColor: themeVars.colors.status.info,
    color: '#fff',
  },
});

export const flag = style({
  fontSize: '1.2rem',
});

export const label = style({
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
});

