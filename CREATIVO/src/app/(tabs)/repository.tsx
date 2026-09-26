// My Repository: manage your own professional repository
// (edit profile, add skills, experience, projects, portfolio, certificates, organizations, links, contact).

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RepositoryTree } from '@/components/repository/RepositoryTree';
import { SectionContent } from '@/components/repository/SectionContent';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isListSection } from '@/config/forms';
import { getSectionConfig, repositorySections, repositoryStrength } from '@/config/repository';
import { useApp } from '@/store/AppProvider';
import { colors, radius, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import type { RepositorySectionKey } from '@/types';

export default function MyRepositoryScreen() {
  const insets = useSafeAreaInsets();
  const { state, removeItem } = useApp();
  const me = state.me;
  const [active, setActive] = useState<RepositorySectionKey>('skills');
  const scrollRef = useRef<ScrollView>(null);
  const editorY = useRef(0);

  const strength = repositoryStrength(me);
  const missing = repositorySections.filter((s) => s.count(me) === 0);
  const config = getSectionConfig(active);

  // Add/edit destination for a section
  const edit = (key: RepositorySectionKey) =>
    isListSection(key) ? router.push({ pathname: '/edit/[section]', params: { section: key } }) : router.push('/edit/profile');

  const select = (key: RepositorySectionKey) => {
    setActive(key);
    scrollRef.current?.scrollTo({ y: editorY.current - spacing.md, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: TAB_BAR_SPACE, paddingHorizontal: SCREEN_PADDING, gap: spacing.lg }}
      showsVerticalScrollIndicator={false}>
      <View>
        <AppText variant="h1">My Repository</AppText>
        <AppText variant="body" color={colors.textMuted}>
          Who you are, what you can do, what you have done and how to reach you.
        </AppText>
      </View>

      {/* Strength meter */}
      <Card style={styles.strength}>
        <View style={styles.strengthTop}>
          <View style={styles.flex}>
            <AppText variant="overline" color={colors.textSubtle}>
              Repository strength
            </AppText>
            <AppText variant="h1" color={colors.primary}>
              {strength}%
            </AppText>
          </View>
          <Button label="Preview" icon="eye-outline" variant="soft" size="sm" onPress={() => router.push({ pathname: '/repository/[id]', params: { id: me.id } })} />
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${strength}%` }]} />
        </View>
        {missing.length > 0 && (
          <View style={styles.missing}>
            <AppText variant="caption" color={colors.textMuted}>
              Add these to stand out:
            </AppText>
            <View style={styles.missingChips}>
              {missing.map((s) => (
                <Pressable key={s.key} onPress={() => edit(s.key)} style={styles.missingChip}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <AppText variant="small" color={colors.primary} style={styles.bold}>
                    {s.title}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Repository tree with quick "+" / edit actions */}
      <RepositoryTree
        pro={me}
        onSelect={select}
        renderAction={(key) => (
          <Pressable onPress={() => edit(key)} hitSlop={8} style={styles.addBtn} accessibilityLabel={`Add to ${key}`}>
            <Ionicons name={isListSection(key) ? 'add' : 'create-outline'} size={16} color={colors.primary} />
          </Pressable>
        )}
      />

      {/* Editor for the selected section */}
      <View onLayout={(e) => (editorY.current = e.nativeEvent.layout.y)} style={styles.editor}>
        <View style={styles.editorHead}>
          <View style={styles.editorIcon}>
            <Ionicons name={config.icon} size={20} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="h3">{config.title}</AppText>
            <AppText variant="small" color={colors.textMuted}>
              {config.caption}
            </AppText>
          </View>
          <Button
            label={isListSection(active) ? 'Add' : 'Edit'}
            icon={isListSection(active) ? 'add' : 'create-outline'}
            size="sm"
            onPress={() => edit(active)}
          />
        </View>
        <Card>
          <SectionContent
            section={active}
            pro={me}
            onRemove={isListSection(active) ? (id) => removeItem(active, id) : undefined}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  strength: { gap: spacing.sm },
  strengthTop: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  missing: { gap: spacing.xs },
  missingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  missingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: { gap: spacing.sm },
  editorHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editorIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
