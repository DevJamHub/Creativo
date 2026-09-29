// One conversation in the inbox: avatar, name, last message (with "Kamu:" for your own), time,
// and a dot plus bold text while unread.

import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Conversation } from '@/models/message';
import type { PublicProfile } from '@/models/profile';
import { colors, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/time';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';

interface ConversationRowProps {
  conversation: Conversation;
  other?: PublicProfile;
  myId: string;
}

export function ConversationRow({ conversation: c, other, myId }: ConversationRowProps) {
  const name = other?.full_name || 'Pengguna Creativo';
  const unread = c.unread > 0;
  const preview = `${c.last_sender_id === myId ? 'Kamu: ' : ''}${c.last_body}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Percakapan dengan ${name}${unread ? `, ${c.unread} pesan belum dibaca` : ''}`}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.other_id } })}
      style={(state) => [styles.row, state.pressed && styles.pressed, focusRing(state)]}>
      <Avatar uri={other?.avatar_url} name={name} size={48} />
      <View style={styles.flex}>
        <View style={styles.top}>
          <AppText variant="bodyStrong" color={colors.ink} numberOfLines={1} style={styles.flex}>
            {name}
          </AppText>
          <AppText variant="mono" color={unread ? colors.primary : colors.textSubtle} style={styles.time}>
            {timeAgo(c.last_at)}
          </AppText>
        </View>
        <View style={styles.top}>
          <AppText
            variant="caption"
            color={unread ? colors.ink : colors.textMuted}
            numberOfLines={1}
            style={[styles.flex, unread && styles.bold]}>
            {preview}
          </AppText>
          {unread && (
            <View style={styles.badge}>
              <AppText variant="small" color={colors.onPrimary} style={styles.bold}>
                {c.unread}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md },
  pressed: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  time: { fontSize: 11, lineHeight: 15 },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
