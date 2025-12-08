import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const container = style({
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #ccc',
  borderRadius: '15px',
  padding: themeVars.spacing.xl,
  margin: themeVars.spacing.md,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: themeVars.spacing.lg,
  flexWrap: 'wrap',
  gap: themeVars.spacing.md,
});

export const title = style({
  fontSize: themeVars.fontSize['2xl'],
  fontWeight: themeVars.fontWeight.bold,
  color: themeVars.colors.text.primary,
  margin: 0,
});

export const timeRangeSelector = style({
  display: 'flex',
  gap: themeVars.spacing.xs,
  flexWrap: 'wrap',
});

export const timeRangeButton = style({
  padding: `${themeVars.spacing.xs} ${themeVars.spacing.md}`,
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
  },
});

export const active = style({
  backgroundColor: themeVars.colors.status.info,
  color: '#fff',
  borderColor: themeVars.colors.status.info,
  ':hover': {
    backgroundColor: themeVars.colors.status.info,
  },
});

export const chartWrapper = style({
  position: 'relative',
  width: '100%',
  marginBottom: themeVars.spacing.md,
});

export const emptyState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: themeVars.colors.text.secondary,
});

export const stats = style({
  display: 'flex',
  gap: themeVars.spacing.lg,
  paddingTop: themeVars.spacing.md,
  borderTop: `1px solid ${themeVars.colors.border.light}`,
  flexWrap: 'wrap',
});

export const statItem = style({
  display: 'flex',
  gap: themeVars.spacing.xs,
  fontSize: themeVars.fontSize.sm,
});

export const statLabel = style({
  color: themeVars.colors.text.secondary,
});

export const statValue = style({
  color: themeVars.colors.text.primary,
  fontWeight: themeVars.fontWeight.semibold,
});

