// Global Search: people, skills, professions, projects and organizations.
// Searching "React" shows people with the React skill AND projects built with React.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/category/CategoryTile';
import { ProfessionalCard } from '@/components/professional/ProfessionalCard';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { Segmented } from '@/components/ui/Segmented';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { categories, popularSearches } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { IconName } from '@/types';
import { plural } from '@/utils/format';
import {
  searchOrganizations,
  searchPeople,
  searchProfessions,
  searchProjects,
  searchSkills,
  type GroupMatch,
  type ProjectMatch,
} from '@/utils/search';

type Tab = 'all' | 'people' | 'skills' | 'professions' | 'projects' | 'organizations';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const { state, professionals, saveSearch, clearSearches } = useApp();
  const [query, setQuery] = useState(params.q ?? '');
  const [tab, setTab] = useState<Tab>('all');

  const q = query.trim();
  const people = searchPeople(professionals, q);
  const skills = searchSkills(professionals, q);
  const professions = searchProfessions(professionals, q);
  const projects = searchProjects(professionals, q);
  const organizations = searchOrganizations(professionals, q);
  const total = people.length + skills.length + projects.length + organizations.length;

  // Tapping a skill / profession / organization narrows the search to people with it
  const drillDown = (value: string) => {
    setQuery(value);
    setTab('people');
    saveSearch(value);
  };

  const openProject = (m: ProjectMatch) => {
    saveSearch(q);
    router.push({ pathname: '/repository/[id]', params: { id: m.owner.id, section: 'projects' } });
  };

  const groupList = (items: GroupMatch[], icon: IconName, limit?: number) => (
    <Card style={styles.listCard}>
      {(limit ? items.slice(0, limit) : items).map((g, i) => (
        <Pressable key={g.name} onPress={() => drillDown(g.name)} style={[styles.groupRow, i > 0 && styles.divider]}>
          <View style={styles.groupIcon}>
            <Ionicons name={icon} size={18} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{g.name}</AppText>
            <AppText variant="small" color={colors.textMuted}>
              {plural(g.people.length, 'professional')}
            </AppText>
          </View>
          <View style={styles.avatars}>
            {g.people.slice(0, 3).map((p, j) => (
              <Avatar key={p.id} uri={p.avatar} name={p.name} size={26} ring style={{ marginLeft: j ? -8 : 0 }} />
            ))}
          </View>
        </Pressable>
      ))}
    </Card>
  );

  const projectList = (items: ProjectMatch[], limit?: number) => (
    <View style={styles.gap}>
      {(limit ? items.slice(0, limit) : items).map((m) => (
        <Card key={m.project.id} onPress={() => openProject(m)} style={styles.projectRow}>
          <Image source={{ uri: m.project.images[0] }} style={styles.projectImg} contentFit="cover" />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {m.project.name}
            </AppText>
            <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
              by {m.owner.name} · {m.project.role}
            </AppText>
            <View style={styles.tools}>
              {m.project.tools.slice(0, 3).map((t) => (
                <Chip key={t} label={t} size="sm" tint={colors.surfaceAlt} color={colors.text} />
              ))}
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const block = (title: string, count: number, target: Tab, content: ReactNode) =>
    count > 0 && (
      <View style={styles.gap}>
        <SectionHeader title={title} subtitle={plural(count, 'result')} onAction={() => setTab(target)} />
        {content}
      </View>
    );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      {/* Search header */}
      <View style={styles.header}>
        <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => router.back()} />
        <SearchBar
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (!t) setTab('all');
          }}
          onSubmit={() => saveSearch(q)}
          autoFocus={!params.q}
          style={styles.flex}
        />
      </View>

      {q ? (
        <>
          <View style={styles.tabs}>
            <Segmented<Tab>
              scrollable
              value={tab}
              onChange={setTab}
              items={[
                { key: 'all', label: 'All' },
                { key: 'people', label: `People ${people.length}` },
                { key: 'skills', label: `Skills ${skills.length}` },
                { key: 'professions', label: `Professions ${professions.length}` },
                { key: 'projects', label: `Projects ${projects.length}` },
                { key: 'organizations', label: `Organizations ${organizations.length}` },
              ]}
            />
          </View>

          <ScrollView
            contentContainerStyle={[styles.results, { paddingBottom: insets.bottom + spacing.xxl }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            {tab === 'all' && total === 0 && (
              <EmptyState icon="search-outline" title={`No results for “${q}”`} message="Try a profession, a skill like “React”, or a city." />
            )}

            {tab === 'all' && (
              <>
                {block(
                  'People',
                  people.length,
                  'people',
                  people.slice(0, 3).map((m) => <ProfessionalCard key={m.pro.id} pro={m.pro} reasons={m.reasons} />),
                )}
                {block('Skills', skills.length, 'skills', groupList(skills, 'flash-outline', 3))}
                {block('Projects', projects.length, 'projects', projectList(projects, 3))}
                {block('Professions', professions.length, 'professions', groupList(professions, 'briefcase-outline', 3))}
                {block('Organizations', organizations.length, 'organizations', groupList(organizations, 'people-outline', 3))}
              </>
            )}

            {tab === 'people' &&
              (people.length ? (
                people.map((m) => <ProfessionalCard key={m.pro.id} pro={m.pro} reasons={m.reasons} />)
              ) : (
                <EmptyState icon="person-outline" title="No people found" />
              ))}
            {tab === 'skills' && (skills.length ? groupList(skills, 'flash-outline') : <EmptyState icon="flash-outline" title="No skills found" />)}
            {tab === 'professions' &&
              (professions.length ? groupList(professions, 'briefcase-outline') : <EmptyState icon="briefcase-outline" title="No professions found" />)}
            {tab === 'projects' && (projects.length ? projectList(projects) : <EmptyState icon="layers-outline" title="No projects found" />)}
            {tab === 'organizations' &&
              (organizations.length ? groupList(organizations, 'people-outline') : <EmptyState icon="people-outline" title="No organizations found" />)}
          </ScrollView>
        </>
      ) : (
        // Before typing: recent + popular searches and categories
        <ScrollView contentContainerStyle={[styles.results, { paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
          {state.recentSearches.length > 0 && (
            <View style={styles.gap}>
              <SectionHeader title="Recent searches" actionLabel="Clear" onAction={clearSearches} />
              <View style={styles.wrap}>
                {state.recentSearches.map((s) => (
                  <Chip key={s} label={s} icon="time-outline" onPress={() => setQuery(s)} />
                ))}
              </View>
            </View>
          )}
          <View style={styles.gap}>
            <SectionHeader title="Popular searches" />
            <View style={styles.wrap}>
              {popularSearches.map((s) => (
                <Chip key={s} label={s} icon="trending-up" onPress={() => setQuery(s)} />
              ))}
            </View>
          </View>
          <View style={styles.gap}>
            <SectionHeader title="Browse categories" />
            {categories.map((c) => (
              <CategoryTile
                key={c.id}
                variant="row"
                category={c}
                count={professionals.filter((p) => p.categoryId === c.id).length}
                onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: SCREEN_PADDING },
  flex: { flex: 1 },
  tabs: { paddingTop: spacing.md, paddingLeft: SCREEN_PADDING },
  results: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.lg, gap: spacing.xl },
  gap: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  listCard: { paddingVertical: spacing.xxs },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatars: { flexDirection: 'row' },
  projectRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.sm },
  projectImg: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
});
