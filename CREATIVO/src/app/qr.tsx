// Professional QR Card: show it at events so people can open your repository instantly.

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useApp } from '@/store/AppProvider';
import { useProfessional } from '@/store/hooks';
import { colors, gradients, radius, SCREEN_PADDING, shadows, spacing } from '@/theme';
import { profileDeepLink } from '@/utils/links';

export default function QrScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { state } = useApp();
  const pro = useProfessional(params.id ?? state.me.id) ?? state.me;
  const isMe = pro.id === state.me.id;
  const link = profileDeepLink(pro.id);

  const share = () => Share.share({ message: `${pro.name} · ${pro.profession}\nView my Creativo repository: ${link}` });

  return (
    <LinearGradient colors={gradients.ink} style={[styles.screen, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.top}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} background="rgba(255,255,255,0.12)" color={colors.white} elevated={false} />
        <AppText variant="h3" color={colors.white}>
          {isMe ? 'My Professional QR' : 'Professional QR'}
        </AppText>
        <View style={styles.spacer} />
      </View>

      {/* The card */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Avatar uri={pro.avatar} name={pro.name} size={64} />
          <View style={styles.flex}>
            <AppText variant="h2" numberOfLines={1}>
              {pro.name}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {pro.profession}
            </AppText>
            <AppText variant="small" color={colors.primary} style={styles.bold}>
              @{pro.handle}
            </AppText>
          </View>
        </View>

        <View style={styles.qrWrap}>
          <QRCode value={link} size={210} color={colors.ink} backgroundColor={colors.white} />
        </View>

        <View style={styles.hint}>
          <Ionicons name="scan-outline" size={16} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textMuted} align="center">
            Scan to open {isMe ? 'my' : 'this'} Creativo repository
          </AppText>
        </View>
        <View style={styles.cardFoot}>
          <Logo size={22} />
          <AppText variant="small" color={colors.textSubtle} style={styles.flexShrink} numberOfLines={1}>
            {pro.location}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Share profile link" icon="share-outline" size="lg" onPress={share} fullWidth />
        <AppText variant="small" color="rgba(255,255,255,0.6)" align="center">
          Meeting someone at an event? Let them scan this card with their phone camera.
        </AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: SCREEN_PADDING, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spacer: { width: 42 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.lg,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  bold: { fontWeight: '700' },
  qrWrap: {
    alignSelf: 'center',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actions: { gap: spacing.sm },
});
