// Creativo design tokens.
// All screens and components read from here so spacing, color and type stay consistent.

import { Platform, type TextStyle } from 'react-native';

export const colors = {
  // Brand: electric violet + warm coral, on a calm off-white canvas
  primary: '#5B3DF5',
  primaryDark: '#3F24D6',
  primarySoft: '#EFEBFF',
  accent: '#FF6B4A',
  accentSoft: '#FFEEE9',
  mint: '#12B5A0',
  mintSoft: '#E1F7F3',
  amber: '#F2A10C',
  amberSoft: '#FFF4DB',

  ink: '#0E0F1A',
  text: '#1B1D2A',
  textMuted: '#686C80',
  textSubtle: '#9A9DB0',

  background: '#F7F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F1F7',
  border: '#E7E7F0',

  success: '#16A34A',
  successSoft: '#E5F6EB',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
} as const;

// Gradient used by the logo, hero banners and the QR card
export const gradients = {
  brand: ['#6A4BFF', '#8F5BFF', '#FF7A59'] as const,
  ink: ['#171833', '#2B1F6B'] as const,
};

// 4pt spacing scale
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

// Subtle shadows (RN new architecture supports the CSS-like boxShadow on every platform)
export const shadows = {
  sm: { boxShadow: '0px 1px 3px rgba(20, 20, 43, 0.06)' },
  md: { boxShadow: '0px 6px 20px rgba(20, 20, 43, 0.07)' },
  lg: { boxShadow: '0px 12px 32px rgba(40, 24, 140, 0.16)' },
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.8 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  mono: { fontSize: 13, lineHeight: 20, fontWeight: '500', fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

// Horizontal padding used by every screen
export const SCREEN_PADDING = spacing.lg;
// Height reserved for the floating tab bar so content isn't hidden behind it
export const TAB_BAR_SPACE = 110;
