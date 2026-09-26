// Search input. When `onPress` is set it renders as a button (e.g. on Home it opens the Search screen).

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, shadows, spacing, typography } from '@/theme';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onPress,
  placeholder = 'Search people, skills, projects…',
  autoFocus,
  style,
}: SearchBarProps) {
  const icon = <Ionicons name="search" size={20} color={colors.textMuted} />;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="search"
        style={({ pressed }) => [styles.bar, pressed && { opacity: 0.85 }, style]}>
        {icon}
        <AppText variant="body" color={colors.textSubtle} numberOfLines={1} style={styles.flex}>
          {placeholder}
        </AppText>
        <View style={styles.kbd}>
          <Ionicons name="options-outline" size={16} color={colors.primary} />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.bar, style]}>
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={[styles.input, styles.flex]}
      />
      {!!value && (
        <Pressable onPress={() => onChangeText?.('')} hitSlop={8} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  flex: { flex: 1 },
  input: { ...typography.body, color: colors.text, height: '100%', paddingVertical: 0 },
  kbd: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
