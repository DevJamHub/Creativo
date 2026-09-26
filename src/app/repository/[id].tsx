// Professional Repository viewer.
// Overview shows the repository tree; each section can be opened on its own,
// and the section tabs let you browse the repository like folders.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectButton } from '@/components/professional/ConnectButton';
import { ContactSheet } from '@/components/professional/ContactSheet';
import { RepositoryTree } from '@/components/repository/RepositoryTree';
import { SectionContent } from '@/components/repository/SectionContent';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getSectionConfig, isSectionKey, repositorySections } from '@/config/repository';
import { useApp } from '@/store/AppProvider';
import { useProfessional } from '@/store/hooks';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { RepositorySectionKey } from '@/types';

// "overview" shows the tree; any section key shows that section
type RepoView = 'overview' | RepositorySectionKey;

export default function RepositoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; section?: string }>();
  const pro = useProfessional(params.id);
  const { state } = useApp();
  const [view, setView] = useState<RepoView>(isSectionKey(params.section) ? params.section : 'overview');
  const [contactOpen, setContactOpen] = useState(false);

  if (!pro) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Repository" />
        <EmptyState icon="folder-outline" title="Repository not found" />
      </View>
    );
  }

  const isMe = pro.id === state.me.id;
  const config = view === 'overview' ? null : getSectionConfig(view);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Repository" subtitle={`${pro.handle} / ${config ? config.key : 'overview'}`} />

      {/* Folder tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} style={styles.tabsBar}>
        {(['overview', ...repositorySections.map((s) => s.key)] as RepoView[]).map((key) => {
          const active = key === view;
          const c = key === 'overview' ? null : getSectionConfig(key);
          return (
            <Pressable
              key={key}
              onPress={() => setView(key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Ionicons name={c ? c.icon : 'folder-open-outline'} size={15} color={active ? colors.white : colors.textMuted} />
              <AppText variant="caption" color={active ? colors.white : colors.textMuted} style={styles.bold}>
                {c ? c.title : 'Overview'}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
        {/* Owner summary */}
        <Pressable
          style={styles.owner}
          onPress={() => router.push({ pathname: '/professional/[id]', params: { id: pro.id } })}>
          <Avatar uri={pro.avatar} name={pro.name} size={52} />
          <View style={styles.flex}>
            <AppText variant="h3">{pro.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {pro.profession} · {pro.location.split(',')[0]}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </Pressable>

        {view === 'overview' ? (
          <>
            <AppText variant="body" color={colors.textMuted}>
              “Who I am, what I can do, what I have done, and how you can reach me.”
            </AppText>
            <RepositoryTree pro={pro} onSelect={setView} />
          </>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <View style={styles.sectionIcon}>
                <Ionicons name={config!.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <AppText variant="h2">{config!.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {config!.caption}
                </AppText>
              </View>
            </View>
            {view === 'projects' || view === 'portfolio' ? (
              <SectionContent section={view} pro={pro} />
            ) : (
              <Card>
                <SectionContent section={view} pro={pro} />
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {/* Sticky Connect / Contact bar */}
      {!isMe && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <ConnectButton pro={pro} fullWidth />
          <Button label="Contact" icon="chatbubble-ellipses-outline" variant="dark" onPress={() => setContactOpen(true)} />
        </View>
      )}
      {!isMe && <ContactSheet pro={pro} visible={contactOpen} onClose={() => setContactOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  tabsBar: { flexGrow: 0 },
  tabs: { gap: 6, paddingHorizontal: SCREEN_PADDING, paddingBottom: spacing.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  bold: { fontWeight: '700' },
  content: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm, gap: spacing.md },
  owner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  flex: { flex: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
