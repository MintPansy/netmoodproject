import { style } from '@vanilla-extract/css';
import { themeVars } from '@/styles/theme.css';

export const container = style({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: themeVars.spacing.lg,
  minHeight: '100vh',
  '@media': {
    '(max-width: 768px)': {
      padding: themeVars.spacing.md,
    },
  },
});

export const header = style({
  textAlign: 'center',
  marginBottom: themeVars.spacing['2xl'],
  padding: themeVars.spacing.xl,
  '@media': {
    '(max-width: 768px)': {
      padding: themeVars.spacing.md,
      marginBottom: themeVars.spacing.xl,
    },
  },
});

export const title = style({
  fontSize: themeVars.fontSize['3xl'],
  fontWeight: themeVars.fontWeight.extrabold,
  color: '#1f6f68',
  marginBottom: themeVars.spacing.sm,
  '@media': {
    '(max-width: 768px)': {
      fontSize: themeVars.fontSize['2xl'],
    },
  },
});

export const subtitle = style({
  fontSize: themeVars.fontSize.lg,
  color: themeVars.colors.text.secondary,
  '@media': {
    '(max-width: 768px)': {
      fontSize: themeVars.fontSize.base,
    },
  },
});

export const content = style({
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
  '@media': {
    '(max-width: 768px)': {
      fontSize: themeVars.fontSize.xl,
    },
  },
});

export const emotionGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: themeVars.spacing.md,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const loading = style({
  textAlign: 'center',
  padding: themeVars.spacing.xl,
  color: themeVars.colors.text.secondary,
});

export const threatSection = style({
  background: 'rgba(255, 193, 7, 0.1)',
  border: `2px solid ${themeVars.colors.status.warning}`,
  borderRadius: themeVars.borderRadius.lg,
  padding: themeVars.spacing.lg,
  marginBottom: themeVars.spacing.lg,
});

export const threatTitle = style({
  fontSize: themeVars.fontSize.xl,
  fontWeight: themeVars.fontWeight.bold,
  color: themeVars.colors.status.warning,
  marginBottom: themeVars.spacing.md,
});

export const threatItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeVars.spacing.md,
  padding: themeVars.spacing.sm,
  fontSize: themeVars.fontSize.base,
  color: themeVars.colors.text.primary,
});

