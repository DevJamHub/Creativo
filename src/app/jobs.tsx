// Lowongan: remote job openings for the user's field, fetched live from the Himalayas REST API.
// Request → loading → JSON → cards. A failed request shows a clear message and "Coba lagi";
// a failed refresh keeps the list on screen and says so above it.

import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useJobs } from '@/controllers/useJobs';
import { formatCount, JOB_SOURCE, jobKeyword, type Job } from '@/models/job';
import { getProfession, professions } from '@/models/profession';
import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing } from '@/theme';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { JobCard } from '@/views/jobs/JobCard';
import { AppText } from '@/views/ui/AppText';
import { Chip } from '@/views/ui/Chip';
import { DataStatus } from '@/views/ui/DataStatus';
import { EmptyState } from '@/views/ui/EmptyState';
import { ErrorState } from '@/views/ui/ErrorState';
import { IconButton } from '@/views/ui/IconButton';
import { LoadingState } from '@/views/ui/LoadingState';

const ALL = 'all';
// "Profesional Lainnya" has no keyword of its own; it is covered by "Semua bidang"
const fields = professions.filter((p) => p.id !== 'other');

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
const openJob = (job: Job) => WebBrowser.openBrowserAsync(job.url);
const openSource = () => WebBrowser.openBrowserAsync(JOB_SOURCE.url);

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const own = useAuthContext().profile?.profession;
  // Start on the user's own field
  const [field, setField] = useState(() => (own && fields.some((p) => p.id === own) ? own : ALL));
  const [indonesiaOnly, setIndonesiaOnly] = useState(true);
  const { status, jobs, total, error, refreshing, reload } = useJobs({ keyword: jobKeyword(field), indonesiaOnly });

  const fieldLabel = field === ALL ? 'semua bidang' : getProfession(field).label;

  const header = (
    <View style={styles.header}>
      <AppText variant="body" color={colors.textMuted}>
        Lowongan remote untuk <AppText variant="bodyStrong">{fieldLabel}</AppText>, diambil langsung dari API {JOB_SOURCE.name}.
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        <Chip label="Semua bidang" size="sm" selected={field === ALL} onPress={() => setField(ALL)} />
        {fields.map((p) => (
          <Chip
            key={p.id}
            label={p.label}
            icon={p.icon}
            size="sm"
            color={p.color}
            tint={p.tint}
            selected={field === p.id}
            onPress={() => setField(field === p.id ? ALL : p.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.row}>
        <Chip
          label="Bisa dari Indonesia"
          icon="location-outline"
          size="sm"
          color={colors.success}
          tint={colors.successSoft}
          selected={indonesiaOnly}
          onPress={() => setIndonesiaOnly((v) => !v)}
        />
      </View>

      <View style={styles.row}>
        <DataStatus status={refreshing ? 'loading' : status} />
        {status === 'success' && (
          <AppText variant="mono" color={colors.textSubtle} numberOfLines={1} style={styles.count}>
            {jobs.length} dari {formatCount(total)}
          </AppText>
        )}
      </View>

      {/* A refresh failed but the earlier list is still here */}
      {status === 'error' && jobs.length > 0 && <ErrorBanner message={`Gagal memperbarui data. ${error?.message ?? ''}`} />}
    </View>
  );

  const empty =
    status === 'loading' ? (
      <LoadingState />
    ) : status === 'error' ? (
      <ErrorState message={error?.message} onRetry={reload} />
    ) : (
      <EmptyState
        icon="briefcase-outline"
        title="Belum ada lowongan"
        message={indonesiaOnly ? 'Coba bidang lain, atau matikan filter "Bisa dari Indonesia".' : 'Coba bidang lain.'}
      />
    );

  const footer =
    jobs.length > 0 ? (
      <Pressable accessibilityRole="link" onPress={openSource} style={(state) => [styles.source, focusRing(state)]}>
        <AppText variant="caption" color={colors.textSubtle} align="center">
          Data lowongan dari <AppText variant="caption" color={colors.primary}>{JOB_SOURCE.name}</AppText>. Lamar langsung di halaman
          lowongannya.
        </AppText>
      </Pressable>
    ) : null;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
        <AppText variant="h1" color={colors.ink} accessibilityRole="header" style={styles.flex}>
          Lowongan
        </AppText>
        <IconButton icon="refresh" accessibilityLabel="Muat ulang lowongan" size={40} onPress={reload} />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(job) => job.id}
        renderItem={({ item }) => <JobCard job={item} onPress={openJob} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  list: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: SCREEN_PADDING, gap: spacing.sm },
  header: { gap: spacing.sm, paddingBottom: spacing.xs },
  // Horizontal rows run edge to edge while their first item lines up with the page padding
  bleed: { marginHorizontal: -SCREEN_PADDING },
  chips: { gap: spacing.xs, paddingHorizontal: SCREEN_PADDING },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  count: { marginLeft: 'auto' },
  source: { paddingVertical: spacing.md },
});
