import { style } from '@vanilla-extract/css';

/**
 * 반응형 유틸리티 클래스
 */

export const mobileOnly = style({
  '@media': {
    '(min-width: 769px)': {
      display: 'none',
    },
  },
});

export const desktopOnly = style({
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
});

export const container = style({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 16px',
  '@media': {
    '(max-width: 768px)': {
      padding: '0 12px',
    },
  },
});

export const grid = style({
  display: 'grid',
  gap: '16px',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '12px',
    },
  },
});

export const grid2Cols = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const grid3Cols = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  '@media': {
    '(max-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

