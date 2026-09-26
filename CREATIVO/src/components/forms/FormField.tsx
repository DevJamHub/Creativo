// Labeled form field: text input, or selectable chips when `options` is given.

import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import type { FieldDef } from '@/config/forms';
import { colors, radius, spacing, typography } from '@/theme';

export interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" style={styles.label}>
        {field.label}
        {field.required && <AppText variant="caption" color={colors.accent}> *</AppText>}
      </AppText>

      {field.options ? (
        <View style={styles.options}>
          {field.options.map((o) => (
            <Chip key={o} label={o.charAt(0).toUpperCase() + o.slice(1)} size="sm" selected={value === o} onPress={() => onChange(o)} />
          ))}
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textSubtle}
          multiline={field.multiline}
          keyboardType={field.keyboardType ?? 'default'}
          autoCapitalize={field.keyboardType === 'url' || field.keyboardType === 'email-address' ? 'none' : 'sentences'}
          style={[styles.input, field.multiline && styles.multiline, !!error && styles.inputError]}
        />
      )}

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : (
        field.hint && (
          <AppText variant="small" color={colors.textSubtle}>
            {field.hint}
          </AppText>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontWeight: '700' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
});
