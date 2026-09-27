// Friends: your connections, incoming requests and suggestions. Empty until the social graph exists.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getProfession } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';

type FriendsView = 'friends' | 'requests' | 'suggested';

export default function FriendsScreen() {
  const { profile } = useAuthContext();
  const profession = getProfession(profile?.profession);
  const [view, setView] = useState<FriendsView>('friends');
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;

  const empty = {
    friends: {
      icon: 'people-outline',
      title: 'No friends yet',
      message: 'People you connect with will show up here.',
    },
    requests: {
      icon: 'mail-unread-outline',
      title: 'No requests',
      message: 'Friend requests you receive will show up here.',
    },
    suggested: {
      icon: 'sparkles-outline',
      title: 'No suggestions yet',
      message: `We will suggest ${profession.label.toLowerCase()}s and people in related fields as they join.`,
    },
  } as const;

  return (
    <Screen
      tabBar
      header={
        <View>
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Friends
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Your professional circle
          </AppText>
        </View>
      }>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search people by name or profession"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="Search people"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      {searching ? (
        <EmptyState icon="search-outline" title="No one found" message={`No people match "${query.trim()}" yet.`} />
      ) : (
        <>
          <SegmentedControl<FriendsView>
            segments={[
              { value: 'friends', label: 'Friends', count: 0 },
              { value: 'requests', label: 'Requests', count: 0 },
              { value: 'suggested', label: 'Suggested' },
            ]}
            value={view}
            onChange={setView}
          />
          <EmptyState icon={empty[view].icon} title={empty[view].title} message={empty[view].message} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, height: '100%', fontSize: 15, color: colors.ink, outlineWidth: 0 },
});
