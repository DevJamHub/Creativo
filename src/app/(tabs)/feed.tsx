// Feed: work people share (app screenshots, design shots, renders...). Empty until posting exists.

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getProfession } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';

type FeedView = 'forYou' | 'friends' | 'field';

export default function FeedScreen() {
  const { profile } = useAuthContext();
  const profession = getProfession(profile?.profession);
  const [view, setView] = useState<FeedView>('forYou');

  const empty: Record<FeedView, { title: string; message: string }> = {
    forYou: {
      title: 'The feed is quiet',
      message: `Be the first to share. Upload your ${profession.showcase.noun} and they will appear here.`,
    },
    friends: {
      title: 'No posts from friends',
      message: 'When your friends share their work, you will see it here.',
    },
    field: {
      title: `Nothing from ${profession.label.toLowerCase()}s yet`,
      message: 'Posts from people in your field will show up here.',
    },
  };

  return (
    <Screen
      tabBar
      header={
        <View style={styles.header}>
          <View style={styles.flex}>
            <AppText variant="h1" color={colors.ink} accessibilityRole="header">
              Feed
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Work shared by the community
            </AppText>
          </View>
          <IconButton icon="add" accessibilityLabel="Upload your work" onPress={() => router.push('/upload')} />
        </View>
      }>
      <SegmentedControl<FeedView>
        segments={[
          { value: 'forYou', label: 'For you' },
          { value: 'friends', label: 'Friends' },
          { value: 'field', label: 'My field' },
        ]}
        value={view}
        onChange={setView}
      />

      <EmptyState
        icon={profession.showcase.icon}
        color={profession.color}
        title={empty[view].title}
        message={empty[view].message}
        actionLabel="Upload"
        actionIcon="cloud-upload-outline"
        onAction={() => router.push('/upload')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
