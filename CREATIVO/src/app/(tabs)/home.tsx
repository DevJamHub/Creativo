// Home / Discover: search, recommendations, categories, recently viewed,
// suggested connections and explore by profession.

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { CategoryTile } from '@/components/category/CategoryTile';
import { ConnectButton } from '@/components/professional/ConnectButton';
import { PersonRow } from '@/components/professional/PersonRow';
import { ProfessionalMiniCard } from '@/components/professional/ProfessionalMiniCard';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { repositoryStrength } from '@/config/repository';
import { categories, getCategory, popularSearches } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { useNetwork, useRecommended } from '@/store/hooks';
import { colors, gradients, radius, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import type { CategoryId } from '@/types';
import { firstName } from '@/utils/format';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 15) return 'Good afternoon';
  if (h < 19) return 'Good evening';
  return 'Good night';
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state, professionals } = useApp();
  const { suggested } = useNetwork();
  const recommended = useRecommended();
  const recent = state.recentlyViewed
    .map((id) => professionals.find((p) => p.id === id))
    .filter((p) => p !== undefined);

  const countIn = (id: CategoryId) => professionals.filter((p) => p.categoryId === id).length;
  // Popular categories: the user's interests first, then the rest
  const popular = [
    ...categories.filter((c) => state.interests.includes(c.id)),
    ...categories.filter((c) => !state.interests.includes(c.id) && c.id !== 'other'),
  ].slice(0, 6);
  const professions = Array.from(new Set(professionals.map((p) => p.profession)));
  const strength = repositoryStrength(state.me);

  const openSearch = (q?: string) => router.push(q ? { pathname: '/search', params: { q } } : '/search');
  const openCategory = (id: CategoryId) => router.push({ pathname: '/category/[id]', params: { id } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: TAB_BAR_SPACE }}
      showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={[styles.pad, styles.topBar]}>
        <Logo size={30} />
        <View style={styles.topActions}>
          <IconButton icon="qr-code-outline" accessibilityLabel="My QR card" onPress={() => router.push('/qr')} />
          <Pressable onPress={() => router.push('/profile')} accessibilityLabel="My profile">
            <Avatar uri={state.me.avatar} name={state.me.name} size={42} />
          </Pressable>
        </View>
      </View>

      {/* Hero + search */}
      <View style={[styles.pad, styles.hero]}>
        <AppText variant="caption" color={colors.textMuted}>
          {greeting()}, {firstName(state.me.name)} 👋
        </AppText>
        <AppText variant="display">
          Who do you <AppText variant="display" color={colors.primary}>need</AppText> today?
        </AppText>
        <SearchBar onPress={() => openSearch()} placeholder="Try “Architect” or “React”" style={styles.search} />
      </View>

      {/* Quick searches */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {popularSearches.map((q) => (
          <Chip key={q} label={q} icon="search" size="sm" onPress={() => openSearch(q)} />
        ))}
      </ScrollView>

      {/* Recommended */}
      <View style={styles.block}>
        <SectionHeader
          style={styles.pad}
          title="Recommended for you"
          subtitle={
            state.interests.length
              ? `Based on ${state.interests.map((i) => getCategory(i).name).slice(0, 2).join(' & ')}`
              : 'Professionals worth knowing'
          }
          onAction={() => router.push('/discover')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {recommended.map((p) => (
            <ProfessionalMiniCard key={p.id} pro={p} />
          ))}
        </ScrollView>
      </View>

      {/* Popular categories */}
      <View style={[styles.block, styles.pad]}>
        <SectionHeader title="Popular categories" onAction={() => router.push('/discover')} />
        <View style={styles.grid}>
          {popular.map((c) => (
            <View key={c.id} style={styles.gridCell}>
              <CategoryTile category={c} count={countIn(c.id)} onPress={() => openCategory(c.id)} />
            </View>
          ))}
        </View>
      </View>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <View style={styles.block}>
          <SectionHeader style={styles.pad} title="Recently viewed" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {recent.map((p) => (
              <Pressable
                key={p.id}
                style={styles.recent}
                onPress={() => router.push({ pathname: '/professional/[id]', params: { id: p.id } })}>
                <Avatar uri={p.avatar} name={p.name} size={60} />
                <AppText variant="small" style={styles.bold} numberOfLines={1}>
                  {firstName(p.name)}
                </AppText>
                <AppText variant="small" color={colors.textMuted} numberOfLines={1} style={styles.tiny}>
                  {p.profession}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Repository strength banner */}
      <Pressable style={[styles.pad, styles.block]} onPress={() => router.push('/repository')}>
        <LinearGradient colors={gradients.ink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.flex}>
            <AppText variant="overline" color="rgba(255,255,255,0.7)">
              Your repository
            </AppText>
            <AppText variant="h3" color={colors.white}>
              {strength}% complete
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.75)">
              A complete repository helps the right people find you.
            </AppText>
            <View style={styles.progress}>
              <View style={[styles.progressFill, { width: `${strength}%` }]} />
            </View>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="folder-open" size={26} color={colors.white} />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Suggested connections */}
      <View style={[styles.block, styles.pad]}>
        <SectionHeader title="Suggested connections" subtitle="People your network knows" onAction={() => router.push('/network')} />
        <Card style={styles.listCard}>
          {suggested.slice(0, 3).map((p, i) => (
            <View key={p.id} style={i > 0 && styles.rowDivider}>
              <PersonRow pro={p} right={<ConnectButton pro={p} size="sm" />} />
            </View>
          ))}
        </Card>
      </View>

      {/* Explore by profession */}
      <View style={[styles.block, styles.pad]}>
        <SectionHeader title="Explore by profession" />
        <View style={styles.wrapChips}>
          {professions.map((p) => (
            <Chip key={p} label={p} onPress={() => openSearch(p)} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pad: { paddingHorizontal: SCREEN_PADDING },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hero: { marginTop: spacing.xl, gap: spacing.xs },
  search: { marginTop: spacing.sm },
  chipRow: { gap: spacing.xs, paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.md },
  block: { marginTop: spacing.xxl, gap: spacing.sm },
  carousel: { gap: spacing.sm, paddingHorizontal: SCREEN_PADDING, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridCell: { width: '50%', padding: 6 },
  recent: { width: 76, alignItems: 'center', gap: 4 },
  bold: { fontWeight: '700' },
  tiny: { fontSize: 10 },
  banner: { borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 4 },
  progress: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: spacing.xs, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: { paddingVertical: spacing.xxs },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  wrapChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
