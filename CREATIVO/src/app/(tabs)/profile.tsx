// My Profile: how others see me, plus quick settings.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { ProfileView } from '@/components/professional/ProfileView';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { useApp } from '@/store/AppProvider';
import { colors, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import type { IconName } from '@/types';

function SettingRow({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.text} />
      <AppText variant="bodyStrong" color={danger ? colors.danger : colors.text} style={styles.flex}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { state, resetOnboarding } = useApp();

  return (
    <ProfileView
      pro={state.me}
      isMe
      bottomSpace={TAB_BAR_SPACE}
      topBar={
        <>
          <Logo size={28} light />
          <IconButton icon="qr-code-outline" accessibilityLabel="My QR card" onPress={() => router.push('/qr')} />
        </>
      }
      footer={
        <View style={styles.settings}>
          <AppText variant="h3">Settings</AppText>
          <Card style={styles.card}>
            <SettingRow icon="folder-open-outline" label="Manage my repository" onPress={() => router.push('/repository')} />
            <SettingRow icon="call-outline" label="Contact information" onPress={() => router.push('/edit/profile')} />
            <SettingRow icon="qr-code-outline" label="Professional QR card" onPress={() => router.push('/qr')} />
            <SettingRow icon="people-outline" label="My network" onPress={() => router.push('/network')} />
            <SettingRow
              icon="refresh-outline"
              label="Replay onboarding"
              onPress={() => {
                resetOnboarding();
                router.replace('/onboarding');
              }}
            />
          </Card>
          <AppText variant="small" color={colors.textSubtle} align="center">
            Creativo MVP · mock data only
          </AppText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  settings: { paddingHorizontal: SCREEN_PADDING, marginTop: spacing.xxl, gap: spacing.sm },
  card: { paddingVertical: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  flex: { flex: 1 },
});
