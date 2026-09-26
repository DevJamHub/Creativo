// Category → Professional List.
// e.g. Architecture: filter by profession within the category and by what you need.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfessionalCard } from '@/components/professional/ProfessionalCard';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { getCategory } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { CategoryId } from '@/types';
import { searchPeople } from '@/utils/search';

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: CategoryId }>();
  const category = getCategory(id);
  const { professionals } = useApp();
  const [query, setQuery] = useState('');
  const [profession, setProfession] = useState<string>('all');

  const inCategory = professionals.filter((p) => p.categoryId === category.id);
  const professions = Array.from(new Set(inCategory.map((p) => p.profession)));
  const results = searchPeople(inCategory, query).filter(({ pro }) => profession === 'all' || pro.profession === profession);

  const header = (
    <View style={styles.header}>
      {/* Category hero */}
      <View style={[styles.hero, { backgroundColor: category.tint }]}>
        <View style={[styles.heroIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={26} color={colors.white} />
        </View>
        <View style={styles.flex}>
          <AppText variant="h2">{category.name}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {category.description}
          </AppText>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder={`What do you need? e.g. “house design”`} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" size="sm" color={category.color} selected={profession === 'all'} onPress={() => setProfession('all')} />
        {professions.map((p) => (
          <Chip key={p} label={p} size="sm" color={category.color} selected={profession === p} onPress={() => setProfession(p)} />
        ))}
      </ScrollView>

      <AppText variant="caption" color={colors.textMuted} style={styles.bold}>
        {results.length} professional{results.length === 1 ? '' : 's'}
      </AppText>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title={category.name} subtitle="Professional list" />
      <FlatList
        data={results}
        keyExtractor={(m) => m.pro.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => <ProfessionalCard pro={item.pro} reasons={query ? item.reasons : undefined} />}
        ListEmptyComponent={
          <EmptyState
            icon={category.icon}
            title="No professionals yet"
            message={`We don't have ${category.name} professionals matching this yet.`}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: SCREEN_PADDING },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.xl },
  heroIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  chips: { gap: 6 },
  bold: { fontWeight: '700' },
});
