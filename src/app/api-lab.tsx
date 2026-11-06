// Uji Kondisi API: a demo screen that sends one request at a time and shows how the app reacts.
//   Week 5  protected endpoint WITH the token → 200 · WITHOUT the token → 401
//   Week 6  200 (slow) · 200 but empty · 404 · 500 · 503 · timeout · offline (turn on airplane mode)
// Each result is drawn with the same LoadingState / EmptyState / ErrorState the real screens use.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useRequest, type RequestStatus } from '@/controllers/useRequest';
import type { IconName } from '@/models/icon';
import type { Post } from '@/models/post';
import { api } from '@/services/api';
import type { ApiResult } from '@/services/http';
import { colors, radius, spacing } from '@/theme';
import { maskToken } from '@/utils/jwt';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { EmptyState } from '@/views/ui/EmptyState';
import { ErrorState } from '@/views/ui/ErrorState';
import { IconButton } from '@/views/ui/IconButton';
import { LoadingState } from '@/views/ui/LoadingState';
import { Screen } from '@/views/ui/Screen';

const back = () => (router.canGoBack() ? router.back() : router.replace('/settings'));

type Item = { id: string; caption: string };

interface Scenario {
  id: string;
  label: string;
  icon: IconName;
  request: string;
  /** Sends the Authorization header */
  withToken: boolean;
  send: (signal: AbortSignal) => Promise<ApiResult<Item[]>>;
}

const listOf = <T,>(result: ApiResult<T>, pick: (data: T) => Item[]): ApiResult<Item[]> =>
  result.error ? result : { data: pick(result.data), error: null };

const fromPosts = (data: { posts: Post[] }) => data.posts.slice(0, 3).map((p) => ({ id: p.id, caption: p.caption }));
const fromDemo = (data: { data: Item[] }) => data.data;

const demo = (path: string, timeoutMs?: number) => (signal: AbortSignal) =>
  api<{ data: Item[] }>(path, { auth: false, signal, timeoutMs }).then((r) => listOf(r, fromDemo));

const protectedScenarios: Scenario[] = [
  {
    id: 'with-token',
    label: 'Dengan token',
    icon: 'key-outline',
    request: 'GET /posts',
    withToken: true,
    send: (signal) => api<{ posts: Post[] }>('/posts', { signal }).then((r) => listOf(r, fromPosts)),
  },
  {
    id: 'without-token',
    label: 'Tanpa token',
    icon: 'ban-outline',
    request: 'GET /posts',
    withToken: false,
    send: (signal) => api<{ posts: Post[] }>('/posts', { auth: false, signal }).then((r) => listOf(r, fromPosts)),
  },
];

const conditionScenarios: Scenario[] = [
  { id: 'slow', label: '200 OK (2 dtk)', icon: 'checkmark-circle-outline', request: 'GET /demo/slow?ms=2000', withToken: false, send: demo('/demo/slow?ms=2000') },
  { id: 'empty', label: 'Data kosong', icon: 'file-tray-outline', request: 'GET /demo/empty', withToken: false, send: demo('/demo/empty') },
  { id: '404', label: '404 Not Found', icon: 'document-outline', request: 'GET /demo/status/404', withToken: false, send: demo('/demo/status/404') },
  { id: '500', label: '500 Server Error', icon: 'construct-outline', request: 'GET /demo/status/500', withToken: false, send: demo('/demo/status/500') },
  { id: '503', label: '503 Unavailable', icon: 'pause-circle-outline', request: 'GET /demo/status/503', withToken: false, send: demo('/demo/status/503') },
  // The server waits 8 s, the app gives up after 5 s
  { id: 'timeout', label: 'Timeout (5 dtk)', icon: 'time-outline', request: 'GET /demo/slow?ms=8000', withToken: false, send: demo('/demo/slow?ms=8000', 5_000) },
];

const statusLooks: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  idle: { label: 'IDLE', color: colors.textMuted, bg: colors.surfaceAlt },
  loading: { label: 'LOADING', color: colors.amber, bg: colors.amberSoft },
  success: { label: 'SUCCESS', color: colors.success, bg: colors.successSoft },
  empty: { label: 'EMPTY', color: colors.sky, bg: colors.skySoft },
  error: { label: 'ERROR', color: colors.danger, bg: colors.dangerSoft },
};

function ScenarioButton({ scenario, active, onPress }: { scenario: Scenario; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Kirim ${scenario.request}, ${scenario.label}`}
      onPress={onPress}
      style={(state) => [styles.scenario, active && styles.scenarioActive, state.pressed && styles.pressed, focusRing(state)]}>
      <Ionicons name={scenario.icon} size={18} color={active ? colors.primary : colors.text} />
      <AppText variant="caption" color={active ? colors.primary : colors.ink} style={styles.scenarioLabel} numberOfLines={1}>
        {scenario.label}
      </AppText>
    </Pressable>
  );
}

export default function ApiLabScreen() {
  const { token } = useAuthContext();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const current = useRef<Scenario | null>(null);
  const request = useRequest<Item[]>((signal) => current.current!.send(signal), { immediate: false });

  function pick(next: Scenario) {
    current.current = next;
    setScenario(next);
    request.run();
  }

  const look = statusLooks[request.status];
  const httpLine =
    request.status === 'success' || request.status === 'empty'
      ? 'HTTP 200 OK'
      : request.error
        ? request.error.status
          ? `HTTP ${request.error.status} · ${request.error.code ?? request.error.kind}`
          : `Tidak ada response · ${request.error.kind}`
        : null;

  return (
    <Screen
      header={
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Uji Kondisi API
          </AppText>
        </View>
      }>
      <AppText variant="body" color={colors.textMuted}>
        Kirim satu request, lalu lihat bagaimana aplikasi menanganinya: loading, data, data kosong, error HTTP, timeout, atau
        offline.
      </AppText>

      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Week 5 · Protected API
        </AppText>
        <View style={styles.grid}>
          {protectedScenarios.map((s) => (
            <ScenarioButton key={s.id} scenario={s} active={scenario?.id === s.id} onPress={() => pick(s)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Week 6 · Kondisi request
        </AppText>
        <View style={styles.grid}>
          {conditionScenarios.map((s) => (
            <ScenarioButton key={s.id} scenario={s} active={scenario?.id === s.id} onPress={() => pick(s)} />
          ))}
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          Offline: nyalakan mode pesawat, lalu tekan tombol mana saja. Matikan lagi, lalu tekan Coba Lagi.
        </AppText>
      </View>

      {/* The request and its state */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.pill, { backgroundColor: look.bg }]}>
            <AppText variant="small" color={look.color} style={styles.pillText}>
              {look.label}
            </AppText>
          </View>
          {request.retrying && (
            <AppText variant="small" color={colors.textMuted}>
              percobaan ke-{request.attempt + 1}
            </AppText>
          )}
        </View>

        {scenario ? (
          <View style={styles.requestBox}>
            <AppText variant="mono" color={colors.ink}>
              {scenario.request}
            </AppText>
            <AppText variant="mono" color={colors.textMuted} numberOfLines={1}>
              {scenario.withToken && token ? `Authorization: Bearer ${maskToken(token)}` : 'Authorization: (tidak dikirim)'}
            </AppText>
            {httpLine && (
              <AppText variant="mono" color={request.error ? colors.danger : colors.success}>
                {httpLine}
              </AppText>
            )}
          </View>
        ) : (
          <AppText variant="caption" color={colors.textMuted}>
            Belum ada request. Pilih salah satu tombol di atas.
          </AppText>
        )}

        {request.status === 'loading' && <LoadingState label={request.retrying ? 'Mencoba lagi…' : 'Memuat data…'} />}
        {request.status === 'success' && (
          <View style={styles.list}>
            {request.data?.map((item) => (
              <View key={item.id} style={styles.item}>
                <Ionicons name="image-outline" size={16} color={colors.primary} />
                <AppText variant="caption" color={colors.text} numberOfLines={2} style={styles.flex}>
                  {item.caption || '(tanpa caption)'}
                </AppText>
              </View>
            ))}
          </View>
        )}
        {request.status === 'empty' && (
          <EmptyState icon="file-tray-outline" title="Belum ada data" message="Request berhasil, tetapi tidak ada data yang tersedia saat ini." />
        )}
        {request.status === 'error' && (
          <ErrorState kind={request.error?.kind} message={request.error?.message} onRetry={request.retry} retrying={request.retrying} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  scenario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexGrow: 1,
    flexBasis: '45%',
  },
  scenarioActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  scenarioLabel: { fontWeight: '700', flexShrink: 1 },
  pressed: { opacity: 0.75 },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontWeight: '800', letterSpacing: 0.6 },
  requestBox: { gap: 2, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  list: { gap: spacing.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 4 },
});
