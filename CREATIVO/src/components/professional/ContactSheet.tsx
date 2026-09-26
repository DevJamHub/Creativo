// Bottom sheet listing a professional's contact channels (email, WhatsApp, phone...).

import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing } from '@/theme';
import type { IconName, Professional } from '@/types';
import { contactUrls, openExternal } from '@/utils/links';

export interface ContactSheetProps {
  pro: Professional;
  visible: boolean;
  onClose: () => void;
}

interface Channel {
  icon: IconName;
  label: string;
  value: string;
  color: string;
  url?: string;
}

export function getContactChannels(pro: Professional): Channel[] {
  const c = pro.contact;
  const list: Channel[] = [];
  if (c.email) list.push({ icon: 'mail', label: 'Email', value: c.email, color: colors.primary, url: contactUrls.email(c.email, pro.name) });
  if (c.whatsapp) list.push({ icon: 'logo-whatsapp', label: 'WhatsApp', value: `+${c.whatsapp}`, color: '#1DAA61', url: contactUrls.whatsapp(c.whatsapp, pro.name) });
  if (c.phone) list.push({ icon: 'call', label: 'Phone', value: c.phone, color: colors.accent, url: contactUrls.phone(c.phone) });
  if (c.other) list.push({ icon: 'chatbubbles', label: 'Other', value: c.other, color: colors.textMuted });
  return list;
}

export function ContactSheet({ pro, visible, onClose }: ContactSheetProps) {
  const insets = useSafeAreaInsets();
  const channels = getContactChannels(pro);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close contact options" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Avatar uri={pro.avatar} name={pro.name} size={44} />
          <View style={styles.flex}>
            <AppText variant="h3">Contact {pro.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {pro.availability}
            </AppText>
          </View>
        </View>

        {channels.map((ch) => (
          <Pressable
            key={ch.label}
            onPress={() => ch.url && openExternal(ch.url)}
            disabled={!ch.url}
            accessibilityRole="button"
            style={({ pressed }) => [styles.channel, pressed && { backgroundColor: colors.surfaceAlt }]}>
            <View style={[styles.channelIcon, { backgroundColor: ch.color }]}>
              <Ionicons name={ch.icon} size={18} color={colors.white} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{ch.label}</AppText>
              <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                {ch.value}
              </AppText>
            </View>
            {ch.url && <Ionicons name="open-outline" size={18} color={colors.textSubtle} />}
          </Pressable>
        ))}

        <AppText variant="small" color={colors.textSubtle} align="center" style={styles.note}>
          Creativo opens your email, WhatsApp or phone app. No messages are sent from Creativo.
        </AppText>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14, 15, 26, 0.4)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  flex: { flex: 1 },
  channel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  channelIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: spacing.sm },
});
