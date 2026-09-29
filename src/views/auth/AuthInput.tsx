// Styled text input for auth forms with label, error state, and password toggle.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, secureTextEntry, style, onFocus, onBlur, ...rest }: AuthInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputRow, rest.multiline && styles.inputRowMultiline, focused && styles.inputFocused, error && styles.inputError]}>
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
