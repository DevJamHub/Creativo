// Layout for modal forms: header with Cancel, scrolling body, sticky Save button.

import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, SCREEN_PADDING, spacing } from '@/theme';

export interface FormScreenProps {
  title: string;
  subtitle?: string;
  saveLabel?: string;
  onSave: () => void;
  children: ReactNode;
}

export function FormScreen({ title, subtitle, saveLabel = 'Save', onSave, children }: FormScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? spacing.lg : insets.top + spacing.sm }]}>
        <Button label="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />
        <View style={styles.center}>
          <AppText variant="h3">{title}</AppText>
          {subtitle && (
            <AppText variant="small" color={colors.textMuted}>
              {subtitle}
            </AppText>
          )}
        </View>
        <View style={styles.side} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button label={saveLabel} icon="checkmark" size="lg" fullWidth onPress={onSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  center: { flex: 1, alignItems: 'center' },
  side: { width: 80 },
  body: { padding: SCREEN_PADDING, gap: spacing.lg },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
