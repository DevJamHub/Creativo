// Explore: Professional Discovery.
// Search by profession, skills, services, experience, location, organization,
// project or category, and narrow down with filters.

import { useState, type ReactNode } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfessionalCard } from '@/components/professional/ProfessionalCard';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { categories } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { colors, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import type { CategoryId } from '@/types';
import { searchFields, searchPeople, type SearchField } from '@/utils/search';

const experienceFilters = [
  { label: 'Any experience', min: 0 },
  { label: '3+ yrs', min: 3 },
  { label: '5+ yrs', min: 5 },
  { label: '8+ yrs', min: 8 },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { professionals } = useApp();
  const [query, setQuery] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [city, setCity] = useState<string>('all');
  const [minYears, setMinYears] = useState(0);

  const cities = Array.from(new Set(professionals.map((p) => p.location.split(',')[0])));

  // 1) text match on the chosen field, 2) category / location / experience filters
  const results = searchPeople(professionals, query, field).filter(
    ({ pro }) =>
      (category === 'all' || pro.categoryId === category) &&
      (city === 'all' || pro.location.startsWith(city)) &&
      pro.yearsOfExperience >= minYears,
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.pad}>
        <AppText variant="h1">Explore</AppText>
        <AppText variant="body" color={colors.textMuted}>
          Discover professionals by what they do and what they have built.
        </AppText>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={field === 'all' ? 'Search professionals…' : `Search by ${field}…`}
          style={styles.search}
        />
      </View>

      <FilterRow label="Search by">
        {searchFields.map((f) => (
          <Chip key={f.key} label={f.label} size="sm" selected={field === f.key} onPress={() => setField(f.key)} />
        ))}
      </FilterRow>

      <FilterRow label="Category">
        <Chip label="All" size="sm" selected={category === 'all'} onPress={() => setCategory('all')} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            size="sm"
            color={c.color}
            selected={category === c.id}
            onPress={() => setCategory(category === c.id ? 'all' : c.id)}
          />
        ))}
      </FilterRow>

      <FilterRow label="Location">
        <Chip label="Anywhere" icon="location-outline" size="sm" selected={city === 'all'} onPress={() => setCity('all')} />
        {cities.map((c) => (
          <Chip key={c} label={c} size="sm" selected={city === c} onPress={() => setCity(city === c ? 'all' : c)} />
        ))}
      </FilterRow>

      <FilterRow label="Experience">
        {experienceFilters.map((e) => (
          <Chip key={e.min} label={e.label} size="sm" selected={minYears === e.min} onPress={() => setMinYears(e.min)} />
        ))}
      </FilterRow>

      <AppText variant="caption" color={colors.textMuted} style={[styles.pad, styles.count]}>
        {results.length} professional{results.length === 1 ? '' : 's'} found
      </AppText>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      data={results}
      keyExtractor={(m) => m.pro.id}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: TAB_BAR_SPACE }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      renderItem={({ item }) => (
        <View style={styles.pad}>
          <ProfessionalCard pro={item.pro} reasons={query ? item.reasons : undefined} />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="search-outline" title="No professionals found" message="Try another keyword or loosen the filters." />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.filter}>
      <AppText variant="overline" color={colors.textSubtle} style={styles.pad}>
        {label}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  pad: { paddingHorizontal: SCREEN_PADDING },
  search: { marginTop: spacing.md },
  filter: { gap: 6 },
  chips: { gap: 6, paddingHorizontal: SCREEN_PADDING },
  count: { fontWeight: '700' },
});
