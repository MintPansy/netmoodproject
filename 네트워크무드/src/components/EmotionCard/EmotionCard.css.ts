import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const card = style({
  background: 'rgba(255, 255, 255, 0.95)',
  border: '2px solid',
  borderRadius: '15px',
  padding: themeVars.spacing.lg,
  margin: themeVars.spacing.md,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  marginBottom: themeVars.spacing.md,
});

export const emoji = style({
  fontSize: '2.5rem',
  marginRight: themeVars.spacing.md,
});

export const info = style({
  flex: 1,
});

export const title = style({
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
  color: themeVars.colors.text.primary,
});

export const englishLabel = style({
  fontSize: '0.875rem',
  color: themeVars.colors.text.secondary,
  textTransform: 'capitalize',
});

export const valueContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: themeVars.spacing.sm,
});

export const percentage = style({
  fontSize: '2rem',
  fontWeight: 700,
  color: themeVars.colors.text.primary,
});

export const intensity = style({
  fontSize: '0.875rem',
  color: themeVars.colors.text.secondary,
});

export const progressBar = style({
  width: '100%',
  height: '8px',
  backgroundColor: themeVars.colors.bg.secondary,
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: themeVars.spacing.md,
});

export const progressFill = style({
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease',
});

export const message = style({
  fontSize: '0.875rem',
  color: themeVars.colors.text.secondary,
  margin: 0,
  lineHeight: 1.6,
});

