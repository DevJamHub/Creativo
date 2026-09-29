// One comment or reply, Instagram-style: avatar, name + text, then "time · N suka · Balas · Bagikan",
// with a heart on the right. Replies render smaller; a leading "@nama" is highlighted.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';

interface CommentItemProps {
  name: string;
  avatar?: string | null;
  body: string;
  time: string;
  isReply?: boolean;
  /** Leave out the action props to render plain text, e.g. the post caption on top */
  likeCount?: number;
  liked?: boolean;
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  /** Tapping the avatar or name opens the commenter's profile */
  onOpenProfile?: () => void;
}

/** Splits "@budi keren!" into the mention and the rest, so the mention can be colored. */
function splitMention(body: string): [string, string] {
  const match = body.match(/^@\S+/);
  return match ? [match[0], body.slice(match[0].length)] : ['', body];
}

function MetaAction({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} style={focusRing}>
      <AppText variant="small" color={danger ? colors.danger : colors.textMuted} style={styles.metaAction}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function CommentItem({
  name,
  avatar,
  body,
  time,
  isReply,
  likeCount = 0,
  liked,
  onLike,
  onReply,
  onShare,
  onDelete,
  onOpenProfile,
}: CommentItemProps) {
  const [mention, rest] = splitMention(body);

  return (
    <View style={styles.row}>
      <Pressable disabled={!onOpenProfile} onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel={`Buka profil ${name}`} style={focusRing}>
        <Avatar uri={avatar} name={name} size={isReply ? 26 : 34} />
      </Pressable>
      <View style={styles.flex}>
        <AppText variant="body" color={colors.text}>
          <AppText variant="bodyStrong" color={colors.ink} onPress={onOpenProfile}>
            {name}{' '}
          </AppText>
          {mention ? <AppText color={colors.primary}>{mention}</AppText> : null}
          {rest}
        </AppText>

        <View style={styles.meta}>
          <AppText variant="mono" color={colors.textSubtle} style={styles.time}>
            {time}
          </AppText>
          {likeCount > 0 && (
            <AppText variant="small" color={colors.textMuted} style={styles.metaAction}>
              {likeCount} suka
            </AppText>
          )}
          {onReply && <MetaAction label="Balas" onPress={onReply} />}
          {onShare && <MetaAction label="Bagikan" onPress={onShare} />}
          {onDelete && <MetaAction label="Hapus" onPress={onDelete} danger />}
        </View>
      </View>

      {onLike && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Batal suka komentar' : 'Suka komentar'}
          onPress={onLike}
          hitSlop={10}
          style={(state) => [styles.heart, state.pressed && styles.pressed, focusRing(state)]}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={15} color={liked ? colors.danger : colors.textSubtle} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 2, marginTop: 3 },
  time: { fontSize: 11, lineHeight: 15 },
  metaAction: { fontWeight: '600' },
  heart: { paddingTop: 4, paddingHorizontal: 2 },
  pressed: { transform: [{ scale: 0.85 }] },
});
