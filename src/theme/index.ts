// Creativo design tokens — "notebook" theme: Notion's warm paper canvas with Claude's terracotta accent.
// All screens and components read from here so spacing, color and type stay consistent.

import { Platform, type TextStyle } from 'react-native';

export const colors = {
  // Brand: Claude terracotta on warm paper; text on terracotta is always `onPrimary`
  primary: '#D97757',
  primaryDark: '#C15F3C',
  primarySoft: 'rgba(217, 119, 87, 0.12)',
  onPrimary: '#FFFFFF',

  // Supporting accents (profession colors, highlights) — Notion's muted palette
  accent: '#D44C47',
  accentSoft: 'rgba(212, 76, 71, 0.10)',
  violet: '#9065B0',
  violetSoft: 'rgba(144, 101, 176, 0.10)',
  sky: '#337EA9',
  skySoft: 'rgba(51, 126, 169, 0.10)',
  mint: '#448361',
  mintSoft: 'rgba(68, 131, 97, 0.10)',
  amber: '#CB912F',
  amberSoft: 'rgba(203, 145, 47, 0.12)',
  pink: '#C14C8A',
  pinkSoft: 'rgba(193, 76, 138, 0.10)',

  // Foreground, strongest first
  ink: '#191918',
  text: '#37352F',
  textMuted: '#787774',
  textSubtle: '#9B9A97',

  // Surfaces: paper canvas, white cards, then light greys for fills
  background: '#FAF9F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F0EC',
  surfaceRaised: '#FFFFFF',
  border: '#E9E8E3',
  borderStrong: '#D6D4CD',

  success: '#448361',
  successSoft: 'rgba(68, 131, 97, 0.10)',
  danger: '#D44C47',
  dangerSoft: 'rgba(212, 76, 71, 0.08)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  brand: ['#D97757', '#E8A07F', '#F2C9A8'] as const,
  ink: ['#37352F', '#191918'] as const,
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

// Like Notion, depth comes mostly from hairline borders; soft shadows only lift floating UI
export const shadows = {
  sm: { boxShadow: '0px 1px 2px rgba(15, 15, 15, 0.06)' },
  md: { boxShadow: '0px 6px 20px rgba(15, 15, 15, 0.08)' },
  lg: { boxShadow: '0px 12px 32px rgba(15, 15, 15, 0.12)' },
} as const;

// Headings use a serif like Claude; details use monospace like a terminal
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });
const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

export const typography = {
  hero: { fontSize: 40, lineHeight: 46, fontWeight: '600', letterSpacing: -0.8, fontFamily: serif },
  display: { fontSize: 32, lineHeight: 38, fontWeight: '600', letterSpacing: -0.5, fontFamily: serif },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '600', letterSpacing: -0.3, fontFamily: serif },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: mono },
  mono: { fontSize: 13, lineHeight: 20, fontWeight: '500', fontFamily: mono },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

// Horizontal padding used by every screen
export const SCREEN_PADDING = spacing.lg;
// Screens stay readable on tablets / desktop web
export const CONTENT_MAX_WIDTH = 720;
// Height reserved for the bottom tab bar (excluding the safe-area inset) so content isn't hidden behind it
export const TAB_BAR_SPACE = 88;
