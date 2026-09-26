// Styled text input for auth forms with label, error state, and password toggle.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, secureTextEntry, style, ...rest }: AuthInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
          autoCapitalize={rest.autoCapitalize ?? (rest.keyboardType === 'email-address' ? 'none' : 'sentences')}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            accessibilityRole="button">
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSubtle} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="small" color={colors.danger} style={styles.error}>
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
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  error: { marginLeft: 2 },
});
