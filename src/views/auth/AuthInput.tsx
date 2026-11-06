// Styled text input for auth forms: visible label, optional icon, error message, and a show/hide
// toggle for passwords (hidden by default, so nobody reads it over your shoulder).

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  /** Shown inside the field, before the text */
  icon?: IconName;
}

export function AuthInput({ label, error, icon, secureTextEntry, style, onFocus, onBlur, ...rest }: AuthInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputRow, rest.multiline && styles.inputRowMultiline, focused && styles.inputFocused, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textSubtle} />}
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          accessibilityHint={error}
          aria-invalid={!!error}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
          autoCapitalize={
            rest.autoCapitalize ?? (isPassword || rest.keyboardType === 'email-address' ? 'none' : 'sentences')
          }
          autoCorrect={rest.autoCorrect ?? !(isPassword || rest.keyboardType === 'email-address')}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityLabel={hidden ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'}
            accessibilityRole="button">
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSubtle} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="small" color={colors.danger} style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontWeight: '600', marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  inputRowMultiline: { height: undefined, minHeight: 120, alignItems: 'stretch' },
  inputFocused: { borderColor: colors.primary },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    height: '100%',
    // The row draws the focus border; drop the browser's own outline on web
    outlineWidth: 0,
  },
  error: { marginLeft: 2 },
});
