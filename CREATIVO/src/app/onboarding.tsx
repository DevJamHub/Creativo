// Onboarding: 3 intro slides, then "What are you looking for?".

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { CategoryTile } from '@/components/category/CategoryTile';
import { Illustration, type IllustrationKind } from '@/components/onboarding/Illustration';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { categories } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { CategoryId } from '@/types';

const slides: { key: IllustrationKind; step: string; title: string; text: string }[] = [
  {
    key: 'discover',
    step: 'Discover',
    title: 'Discover Professionals',
    text: 'Find the right person by profession, skills, services, location or the projects they have built.',
  },
  {
    key: 'repository',
    step: 'Explore',
    title: 'Explore Professional Repositories',
    text: 'Every professional has a repository: skills, experience, projects, portfolio and certificates in one place.',
  },
  {
    key: 'connect',
    step: 'Connect',
    title: 'Connect with the Right People',
    text: 'Connect, see mutual connections and reach out when you have found the right person.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useApp();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [picking, setPicking] = useState(false); // step 2: choose interests
  const [selected, setSelected] = useState<CategoryId[]>([]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      setPicking(true);
    }
  };

  const toggle = (id: CategoryId) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));

  const finish = (interests: CategoryId[]) => {
    completeOnboarding(interests);
    router.replace('/home');
  };

  // --- Step 2: "What are you looking for?" -----------------------------------
  if (picking) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
        <ScrollView contentContainerStyle={styles.pickContent} showsVerticalScrollIndicator={false}>
          <Logo size={30} />
          <AppText variant="display" style={styles.pickTitle}>
            What are you looking for?
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            Pick the fields you need professionals from. We will tailor your Discover page. You can pick more than one.
          </AppText>
          <View style={styles.grid}>
            {categories.map((c) => (
              <View key={c.id} style={styles.gridCell}>
                <CategoryTile category={c} selected={selected.includes(c.id)} onPress={() => toggle(c.id)} />
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button label="Skip" variant="ghost" onPress={() => finish([])} />
          <Button
            label={selected.length ? `Continue (${selected.length})` : 'Continue'}
            iconRight="arrow-forward"
            size="lg"
            style={styles.flex}
            disabled={selected.length === 0}
            onPress={() => finish(selected)}
          />
        </View>
      </View>
    );
  }

  // --- Step 1: intro slides ---------------------------------------------------
  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <Logo size={30} />
        <Button label="Skip" variant="ghost" size="sm" onPress={() => setPicking(true)} />
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(s) => s.key}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <Illustration kind={item.key} />
            <View style={styles.stepPill}>
              <AppText variant="overline" color={colors.primary}>
                {`0${i + 1} · ${item.step}`}
              </AppText>
            </View>
            <AppText variant="display">{item.title}</AppText>
            <AppText variant="body" color={colors.textMuted}>
              {item.text}
            </AppText>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={index === slides.length - 1 ? 'Get started' : 'Next'}
          iconRight="arrow-forward"
          size="lg"
          onPress={next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.md,
  },
  slide: { paddingHorizontal: SCREEN_PADDING, gap: spacing.sm },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 28, backgroundColor: colors.primary },
  flex: { flex: 1 },
  pickContent: { paddingHorizontal: SCREEN_PADDING, gap: spacing.sm, paddingBottom: spacing.xl },
  pickTitle: { marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginTop: spacing.md },
  gridCell: { width: '50%', padding: 6 },
});
