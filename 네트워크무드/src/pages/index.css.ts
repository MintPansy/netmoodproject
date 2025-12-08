import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const container = style({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: themeVars.spacing.lg,
  minHeight: '100vh',
});

export const header = style({
  textAlign: 'center',
  marginBottom: themeVars.spacing['2xl'],
  padding: themeVars.spacing.xl,
});

export const title = style({
  fontSize: themeVars.fontSize['3xl'],
  fontWeight: themeVars.fontWeight.extrabold,
  color: '#1f6f68',
  marginBottom: themeVars.spacing.sm,
});

export const subtitle = style({
  fontSize: themeVars.fontSize.lg,
  color: themeVars.colors.text.secondary,
});

export const main = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xl,
});

export const emotionsSection = style({
  marginTop: themeVars.spacing.xl,
});

export const sectionTitle = style({
  fontSize: themeVars.fontSize['2xl'],
  fontWeight: themeVars.fontWeight.bold,
  marginBottom: themeVars.spacing.lg,
  color: themeVars.colors.text.primary,
});

export const emotionGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: themeVars.spacing.md,
});

export const loading = style({
  textAlign: 'center',
  padding: themeVars.spacing.xl,
  color: themeVars.colors.text.secondary,
});

export const actions = style({
  display: 'flex',
  justifyContent: 'center',
  gap: themeVars.spacing.md,
  marginTop: themeVars.spacing.xl,
});

export const button = style({
  padding: `${themeVars.spacing.md} ${themeVars.spacing.xl}`,
  fontSize: themeVars.fontSize.base,
  fontWeight: themeVars.fontWeight.semibold,
  color: '#fff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: themeVars.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: '#1d4ed8',
    transform: 'translateY(-2px)',
    boxShadow: themeVars.shadows.md,
  },
});

