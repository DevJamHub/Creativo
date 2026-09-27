// Creativo design tokens — "studio" theme: near-black canvas, electric lime accent.
// All screens and components read from here so spacing, color and type stay consistent.

import { Platform, type TextStyle } from 'react-native';

export const colors = {
  // Brand: electric lime on a studio-black canvas; text on lime is always `onPrimary`
  primary: '#C6F24E',
  primaryDark: '#A9D63A',
  primarySoft: 'rgba(198, 242, 78, 0.12)',
  onPrimary: '#0B0B0F',

  // Supporting accents (profession colors, highlights)
  accent: '#FF7A59',
  accentSoft: 'rgba(255, 122, 89, 0.14)',
  violet: '#A594FF',
  violetSoft: 'rgba(165, 148, 255, 0.14)',
  sky: '#5CC8FF',
  skySoft: 'rgba(92, 200, 255, 0.14)',
  mint: '#3DDC97',
  mintSoft: 'rgba(61, 220, 151, 0.14)',
  amber: '#FFC247',
  amberSoft: 'rgba(255, 194, 71, 0.14)',
  pink: '#FF7AC6',
  pinkSoft: 'rgba(255, 122, 198, 0.14)',

  // Foreground, strongest first
  ink: '#FFFFFF',
  text: '#ECECF1',
  textMuted: '#9D9DAB',
  textSubtle: '#6A6A78',

  // Surfaces, darkest first
  background: '#0B0B0F',
  surface: '#15151B',
  surfaceAlt: '#1D1D25',
  surfaceRaised: '#24242E',
  border: '#2A2A34',
  borderStrong: '#3A3A46',

  success: '#3DDC97',
  successSoft: 'rgba(61, 220, 151, 0.14)',
  danger: '#FF6161',
  dangerSoft: 'rgba(255, 97, 97, 0.12)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  brand: ['#C6F24E', '#7BE0B0', '#5CC8FF'] as const,
  ink: ['#1D1D25', '#0B0B0F'] as const,
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
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

// On a dark canvas depth comes mostly from borders; shadows only lift floating UI
export const shadows = {
  sm: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.4)' },
  md: { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.45)' },
  lg: { boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.55)' },
} as const;

export const typography = {
  hero: { fontSize: 40, lineHeight: 44, fontWeight: '800', letterSpacing: -1.6 },
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -1 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.6 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  mono: { fontSize: 13, lineHeight: 20, fontWeight: '500', fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

// Horizontal padding used by every screen
export const SCREEN_PADDING = spacing.lg;
// Screens stay readable on tablets / desktop web
export const CONTENT_MAX_WIDTH = 720;
// Height reserved for the bottom tab bar (excluding the safe-area inset) so content isn't hidden behind it
export const TAB_BAR_SPACE = 88;
