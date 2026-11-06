// Text with Creativo typography variants, scaled by the text size chosen in Pengaturan.

import { Text, type TextProps } from 'react-native';

import { usePreferences } from '@/controllers/PreferencesProvider';
import { colors, typography, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color = colors.text, align, style, ...rest }: AppTextProps) {
  const { textScale } = usePreferences();
  const base = typography[variant];
  const scaled = textScale === 1 ? base : { ...base, fontSize: base.fontSize * textScale, lineHeight: base.lineHeight * textScale };
  return <Text {...rest} style={[scaled, { color, textAlign: align }, style]} />;
}
