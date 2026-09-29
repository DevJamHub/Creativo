// A direct conversation with one person: bubbles (yours on the right), live incoming messages,
// and a composer at the bottom. The header opens their profile.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { useChat } from '@/controllers/useChat';
import { MESSAGE_MAX, type Message } from '@/models/message';
import { getProfession } from '@/models/profession';
import { colors, CONTENT_MAX_WIDTH, radius, SCREEN_PADDING, spacing, typography } from '@/theme';
import { timeAgo } from '@/utils/time';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { IconButton } from '@/views/ui/IconButton';

const back = () => (router.canGoBack() ? router.back() : router.replace('/network'));

// Show the time under a bubble when the next message is from someone else or 10+ minutes later
const GROUP_MS = 10 * 60_000;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const { profiles } = usePosts();
  const { relation } = useSocial();
  const { thread, loading, error, sending, send } = useChat(id);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const other = id ? profiles[id] : undefined;
  const name = other?.full_name || 'Pengguna Creativo';
  const profession = other?.profession ? getProfession(other.profession) : null;
  const connected = id ? relation(id) === 'connected' : false;

  async function submit() {
    if (await send(draft)) setDraft('');
  }

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.sender_id === user?.id;
    const next = thread[index + 1];
    const lastOfGroup =
      !next || next.sender_id !== item.sender_id || new Date(next.created_at).getTime() - new Date(item.created_at).getTime() > GROUP_MS;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <AppText variant="body" color={mine ? colors.onPrimary : colors.text}>
            {item.body}
          </AppText>
        </View>
        {lastOfGroup && (
          <AppText variant="mono" color={colors.textSubtle} style={styles.time}>
            {timeAgo(item.created_at)}
            {mine && item.read_at ? ' · dibaca' : ''}
          </AppText>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header: who you're talking to */}
      <View style={styles.header}>
        <IconButton icon="arrow-back" accessibilityLabel="Kembali" background="transparent" elevated={false} size={40} onPress={back} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Buka profil ${name}`}
          disabled={!id}
          onPress={() => id && openProfile(id)}
          style={(state) => [styles.who, state.pressed && styles.pressed, focusRing(state)]}>
          <Avatar uri={other?.avatar_url} name={name} size={36} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" color={colors.ink} numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="mono" color={colors.textMuted} style={styles.sub} numberOfLines={1}>
              {[profession?.label, connected ? 'koneksi' : null].filter(Boolean).join(' · ') || 'Creativo'}
            </AppText>
          </View>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={thread}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} accessibilityLabel="Memuat percakapan" />
          ) : (
            <View style={styles.empty}>
              <Avatar uri={other?.avatar_url} name={name} size={72} />
              <AppText variant="h2" color={colors.ink} align="center">
                {name}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} align="center">
                {connected
                  ? 'Kalian sudah terhubung. Sapa dan mulai obrolan profesional.'
                  : 'Kenalkan dirimu dan sampaikan maksudmu, misalnya tawaran proyek atau kerja sama.'}
              </AppText>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <ErrorBanner message={error} />
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Tulis pesan..."
            placeholderTextColor={colors.textSubtle}
            maxLength={MESSAGE_MAX}
            multiline
            style={styles.input}
            accessibilityLabel="Tulis pesan"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kirim pesan"
            disabled={!draft.trim() || sending}
            onPress={submit}
            hitSlop={8}
            style={(state) => [styles.send, !draft.trim() && styles.sendOff, state.pressed && styles.pressed, focusRing(state)]}>
            {sending ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.sm },
  sub: { fontSize: 11, lineHeight: 15 },
  list: {
    flexGrow: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
    gap: 4,
  },
  bubbleRow: { maxWidth: '80%' },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.lg },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  time: { fontSize: 10, lineHeight: 14, marginTop: 3, marginBottom: spacing.xs },
  loading: { marginTop: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl },
  composer: {
    gap: spacing.xs,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  input: {
    ...typography.body,
    flex: 1,
    maxHeight: 120,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendOff: { backgroundColor: colors.borderStrong },
});
