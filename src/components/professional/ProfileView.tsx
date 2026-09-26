// Professional Profile: the hub for everything about one professional.
// Header (photo, name, title, location, bio, Connect/Contact) → stats →
// repository index → About, What I Can Do, Experience, Projects, Portfolio,
// Certificates, Organizations, Professional Links, Contact.

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectButton } from './ConnectButton';
import { ContactSheet } from './ContactSheet';
import { MutualConnections } from './MutualConnections';

import { RepositoryTree } from '@/components/repository/RepositoryTree';
import { SectionContent } from '@/components/repository/SectionContent';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCategory } from '@/data/categories';
import { useNetwork } from '@/store/hooks';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { Professional, RepositorySectionKey } from '@/types';

export interface ProfileViewProps {
  pro: Professional;
  isMe?: boolean;
  topBar?: ReactNode; // buttons drawn over the cover (back, share...)
  footer?: ReactNode; // extra content at the end (e.g. settings on my own profile)
  bottomSpace?: number;
}

// Wrapper for each profile section with an "Open" link into that repository section
function Section({ title, subtitle, onOpen, children }: { title: string; subtitle?: string; onOpen: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} subtitle={subtitle} actionLabel="Open" onAction={onOpen} />
      {children}
    </View>
  );
}

export function ProfileView({ pro, isMe, topBar, footer, bottomSpace = spacing.xxxl }: ProfileViewProps) {
  const insets = useSafeAreaInsets();
  const [contactOpen, setContactOpen] = useState(false);
  const { connected } = useNetwork();
  const category = getCategory(pro.categoryId);

  const openSection = (section: RepositorySectionKey) =>
    router.push({ pathname: '/repository/[id]', params: { id: pro.id, section } });

  const stats = [
    { label: 'Projects', value: pro.projects.length },
    { label: 'Years exp.', value: pro.yearsOfExperience },
    { label: 'Connections', value: isMe ? connected.length : pro.connections.length },
    { label: 'Certificates', value: pro.certificates.length },
  ];

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomSpace }}>
        {/* Cover in the category color */}
        <LinearGradient
          colors={[category.color, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cover, { paddingTop: insets.top + spacing.xs }]}>
          <View style={styles.coverPattern}>
            <Ionicons name={category.icon} size={140} color="rgba(255,255,255,0.12)" />
          </View>
          <View style={styles.topBar}>{topBar}</View>
        </LinearGradient>

        {/* Profile header */}
        <View style={styles.header}>
          <Avatar uri={pro.avatar} name={pro.name} size={104} ring style={styles.avatar} />
          <View style={styles.nameRow}>
            <AppText variant="h1" style={styles.shrink}>
              {pro.name}
            </AppText>
            {pro.verified && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </View>
          <AppText variant="bodyStrong" color={colors.textMuted}>
            {pro.profession}
          </AppText>
          <View style={styles.metaRow}>
            <Chip label={category.name} icon={category.icon} size="sm" tint={category.tint} color={category.color} />
            <View style={styles.loc}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <AppText variant="caption" color={colors.textMuted}>
                {pro.location}
              </AppText>
            </View>
          </View>
          <AppText variant="body" color={colors.text} style={styles.bio}>
            {pro.headline}
          </AppText>

          {!isMe && <MutualConnections pro={pro} />}

          {/* Primary actions */}
          <View style={styles.actions}>
            {isMe ? (
              <>
                <Button label="Edit profile" icon="create-outline" style={styles.flex} onPress={() => router.push('/edit/profile')} />
                <Button label="My QR" icon="qr-code-outline" variant="outline" onPress={() => router.push({ pathname: '/qr', params: { id: pro.id } })} />
              </>
            ) : (
              <>
                <ConnectButton pro={pro} fullWidth />
                <Button label="Contact" icon="chatbubble-ellipses-outline" variant="outline" onPress={() => setContactOpen(true)} />
              </>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
              <AppText variant="h2">{s.value}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>

        {/* Repository index: the entry point into the full repository */}
        <View style={styles.section}>
          <SectionHeader
            title="Professional Repository"
            subtitle="Who they are, what they do, and how to reach them"
            actionLabel="Explore"
            onAction={() => router.push({ pathname: '/repository/[id]', params: { id: pro.id } })}
          />
          <RepositoryTree pro={pro} onSelect={openSection} />
        </View>

        <Section title="About" onOpen={() => openSection('profile')}>
          <Card>
            <SectionContent section="profile" pro={pro} limit={1} />
          </Card>
        </Section>

        <Section title="What I Can Do" subtitle="Skills, services & specializations" onOpen={() => openSection('skills')}>
          <Card style={styles.gapCard}>
            <SectionContent section="skills" pro={pro} limit={8} />
            <View style={styles.divider} />
            <SectionContent section="services" pro={pro} limit={3} />
          </Card>
        </Section>

        <Section title="Experience" onOpen={() => openSection('experience')}>
          <Card>
            <SectionContent section="experience" pro={pro} limit={3} />
          </Card>
        </Section>

        <Section title="Projects" subtitle={`${pro.projects.length} projects`} onOpen={() => openSection('projects')}>
          <SectionContent section="projects" pro={pro} limit={5} />
        </Section>

        <Section title="Portfolio" onOpen={() => openSection('portfolio')}>
          <SectionContent section="portfolio" pro={pro} limit={4} />
        </Section>

        <Section title="Certificates" onOpen={() => openSection('certificates')}>
          <Card>
            <SectionContent section="certificates" pro={pro} limit={3} />
          </Card>
        </Section>

        <Section title="Organizations" onOpen={() => openSection('organizations')}>
          <Card>
            <SectionContent section="organizations" pro={pro} limit={3} />
          </Card>
        </Section>

        <Section title="Professional Links" onOpen={() => openSection('links')}>
          <Card>
            <SectionContent section="links" pro={pro} />
          </Card>
        </Section>

        <Section title="Contact" onOpen={() => openSection('contact')}>
          <Card>
            <SectionContent section="contact" pro={pro} />
          </Card>
        </Section>

        {footer}
      </ScrollView>

      {!isMe && <ContactSheet pro={pro} visible={contactOpen} onClose={() => setContactOpen(false)} />}
    </>
  );
}

const styles = StyleSheet.create({
  cover: { height: 170, paddingHorizontal: SCREEN_PADDING, overflow: 'hidden' },
  coverPattern: { position: 'absolute', right: -20, bottom: -30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { paddingHorizontal: SCREEN_PADDING, gap: spacing.xs },
  avatar: { marginTop: -52, marginBottom: spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bio: { marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  flex: { flex: 1 },
  stats: {
    flexDirection: 'row',
    marginHorizontal: SCREEN_PADDING,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  section: { paddingHorizontal: SCREEN_PADDING, marginTop: spacing.xxl, gap: spacing.sm },
  gapCard: { gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
});
