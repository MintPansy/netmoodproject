import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const card = style({
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #ccc',
  borderRadius: '15px',
  padding: themeVars.spacing.xl,
  margin: themeVars.spacing.md,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
});

export const header = style({
  marginBottom: themeVars.spacing.lg,
});

export const title = style({
  fontSize: '1.5rem',
  fontWeight: 700,
  margin: 0,
  color: themeVars.colors.text.primary,
});

export const scoreContainer = style({
  textAlign: 'center',
  marginBottom: themeVars.spacing.xl,
});

export const score = style({
  fontSize: '4rem',
  fontWeight: 800,
  marginBottom: themeVars.spacing.sm,
  lineHeight: 1,
});

export const status = style({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: themeVars.spacing.md,
});

export const message = style({
  fontSize: '1rem',
  color: themeVars.colors.text.secondary,
  lineHeight: 1.6,
  margin: 0,
});

export const stats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: themeVars.spacing.md,
  marginTop: themeVars.spacing.lg,
});

export const stat = style({
  textAlign: 'center',
  padding: themeVars.spacing.md,
  background: themeVars.colors.bg.secondary,
  borderRadius: '8px',
});

export const statValue = style({
  fontSize: '2rem',
  fontWeight: 700,
  color: themeVars.colors.text.primary,
  marginBottom: themeVars.spacing.xs,
});

export const statLabel = style({
  fontSize: '0.875rem',
  color: themeVars.colors.text.secondary,
});

