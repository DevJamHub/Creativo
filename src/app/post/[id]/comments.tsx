// Comments on a post, Instagram-style: the caption on top, comment threads below, a composer at the bottom.
// Like, reply to and share any comment. Replies sit under their comment behind "Lihat N balasan".
// You can delete your own comments, and any comment on your own post.

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
import { usePost, usePosts } from '@/controllers/PostsProvider';
import { useComments } from '@/controllers/useComments';
import { COMMENT_MAX, type Comment, type CommentThread } from '@/models/post';
import { colors, CONTENT_MAX_WIDTH, radius, SCREEN_PADDING, spacing, typography } from '@/theme';
import { timeAgo } from '@/utils/time';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { CommentItem } from '@/views/feed/CommentItem';
import { shareComment } from '@/views/feed/sharePost';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { Toast, useToast } from '@/views/ui/Toast';

const back = () => (router.canGoBack() ? router.back() : router.replace('/feed'));

/** Who the composer is replying to: the thread it goes into, and the name to show. */
type ReplyTarget = { threadId: string; name: string };

export default function CommentsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuthContext();
  const { profiles } = usePosts();
  const { post, author } = usePost(id);
  const { threads, likedIds, loading, error, sending, send, remove, toggleLike } = useComments(id);
  const toast = useToast();
  const inputRef = useRef<TextInput>(null);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const myName = profile?.full_name || user?.email?.split('@')[0] || 'Kamu';
  const isPostOwner = post?.author_id === user?.id;

  // Commenters who haven't finished onboarding have no public card; fall back to a generic name
  const who = (c: Comment) =>
    c.author_id === user?.id
      ? { name: myName, avatar: profile?.avatar_url }
      : { name: profiles[c.author_id]?.full_name || 'Pengguna Creativo', avatar: profiles[c.author_id]?.avatar_url };

  const expand = (threadId: string, open = true) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (open) next.add(threadId);
      else next.delete(threadId);
      return next;
    });

  function startReply(comment: Comment, threadId: string) {
    const name = who(comment).name;
    setReplyTo({ threadId, name });
    setDraft(`@${name.split(' ')[0]} `);
    expand(threadId);
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyTo(null);
    setDraft('');
  }

  async function submit() {
    if (await send(draft, replyTo?.threadId ?? null)) {
      setDraft('');
      setReplyTo(null);
    }
  }

  const renderComment = (c: Comment, threadId: string, isReply = false) => {
    const { name, avatar } = who(c);
    const canDelete = c.author_id === user?.id || isPostOwner;
    return (
      <CommentItem
        key={c.id}
        name={name}
        avatar={avatar}
        body={c.body}
        time={timeAgo(c.created_at)}
        isReply={isReply}
        likeCount={c.like_count}
        liked={likedIds.has(c.id)}
        onLike={() => toggleLike(c)}
        onReply={() => startReply(c, threadId)}
        onShare={async () => {
          if (!(await shareComment(c, name))) toast.show('Berbagi belum didukung di perangkat ini');
        }}
        onDelete={canDelete ? () => remove(c) : undefined}
        onOpenProfile={() => openProfile(c.author_id)}
      />
    );
  };

  const renderThread = ({ item }: { item: CommentThread }) => {
    const threadId = item.comment.id;
    const open = expanded.has(threadId);
    const count = item.replies.length;
    return (
      <View style={styles.thread}>
        {renderComment(item.comment, threadId)}
        {count > 0 && (
          <View style={styles.replies}>
            <Pressable
              accessibilityRole="button"
              onPress={() => expand(threadId, !open)}
              hitSlop={6}
              style={(state) => [styles.toggle, focusRing(state)]}>
              <View style={styles.toggleLine} />
              <AppText variant="small" color={colors.textMuted} style={styles.toggleText}>
                {open ? 'Sembunyikan balasan' : `Lihat ${count} balasan`}
              </AppText>
            </Pressable>
            {open && item.replies.map((r) => renderComment(r, threadId, true))}
          </View>
        )}
      </View>
    );
  };

  const header = post ? (
    <View style={styles.captionBlock}>
      <CommentItem
        name={author?.full_name || 'Pengguna Creativo'}
        avatar={author?.avatar_url}
        body={post.caption || 'Tanpa caption'}
        time={timeAgo(post.created_at)}
        onOpenProfile={() => openProfile(post.author_id)}
      />
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
        <AppText variant="h3" color={colors.ink} accessibilityRole="header">
          Komentar
        </AppText>
      </View>

      {!post ? (
        <EmptyState icon="image-outline" title="Postingan tidak ditemukan" message="Postingan ini mungkin sudah dihapus." />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(t) => t.comment.id}
          ListHeaderComponent={header}
          renderItem={renderThread}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loading} accessibilityLabel="Memuat komentar" />
            ) : (
              <AppText variant="caption" color={colors.textMuted} align="center" style={styles.empty}>
                Belum ada komentar. Jadilah yang pertama!
              </AppText>
            )
          }
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {post && (
        <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <ErrorBanner message={error} />
          {replyTo && (
            <View style={styles.replyBar}>
              <AppText variant="caption" color={colors.textMuted} style={styles.flex} numberOfLines={1}>
                Membalas <AppText variant="caption" color={colors.ink} style={styles.bold}>{replyTo.name}</AppText>
              </AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Batal membalas" hitSlop={8} onPress={cancelReply} style={focusRing}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          )}
          <View style={styles.inputRow}>
            <Avatar uri={profile?.avatar_url} name={myName} size={34} />
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder={
                replyTo ? `Balas ${replyTo.name}...` : `Tambahkan komentar untuk ${author?.full_name?.split(' ')[0] || 'postingan ini'}...`
              }
              placeholderTextColor={colors.textSubtle}
              maxLength={COMMENT_MAX}
              multiline
              style={styles.input}
              accessibilityLabel={replyTo ? 'Tulis balasan' : 'Tulis komentar'}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={replyTo ? 'Kirim balasan' : 'Kirim komentar'}
              disabled={!draft.trim() || sending}
              onPress={submit}
              hitSlop={8}
              style={focusRing}>
              {sending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <AppText variant="bodyStrong" color={draft.trim() ? colors.primary : colors.textSubtle}>
                  Kirim
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      )}

      <Toast message={toast.message} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.xs,
  },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  captionBlock: { paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  thread: { gap: spacing.sm },
  // Replies line up under the parent's text, past its 34px avatar
  replies: { marginLeft: 34 + spacing.sm, gap: spacing.md },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start' },
  toggleLine: { width: 24, height: 1, backgroundColor: colors.borderStrong },
  toggleText: { fontWeight: '600' },
  loading: { marginTop: spacing.xl },
  empty: { marginTop: spacing.xl },
  composer: {
    gap: spacing.xs,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  input: {
    ...typography.body,
    flex: 1,
    maxHeight: 110,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
