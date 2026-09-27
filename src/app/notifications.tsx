// Notifications: likes, friend requests and mentions. Empty for now.

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/theme';

export default function NotificationsScreen() {
  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            accessibilityLabel="Back"
            size={40}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
          <AppText variant="h2" color={colors.ink} accessibilityRole="header">
            Notifications
          </AppText>
        </View>
      }>
      <EmptyState
        icon="notifications-outline"
        title="You're all caught up"
        message="Likes on your work, friend requests and mentions will show up here."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
