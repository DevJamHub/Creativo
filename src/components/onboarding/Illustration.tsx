// Onboarding illustrations built from real UI pieces (avatars, chips, the repository tree),
// so users preview the actual product: Discover → Explore → Connect.

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { professionals } from '@/data/professionals';
import { colors, gradients, radius, shadows, spacing } from '@/theme';

export type IllustrationKind = 'discover' | 'repository' | 'connect';

const [rizky, andi, sarah, nadia, bima] = professionals;

function FloatingPerson({ name, avatar, role, style }: { name: string; avatar: string; role: string; style: object }) {
  return (
    <View style={[styles.person, style]}>
      <Avatar uri={avatar} name={name} size={34} />
      <View>
        <AppText variant="small" style={styles.bold} numberOfLines={1}>
          {name.split(' ')[0]}
        </AppText>
        <AppText variant="small" color={colors.textMuted} style={styles.tiny} numberOfLines={1}>
          {role}
        </AppText>
      </View>
    </View>
  );
}

function Discover() {
  return (
    <>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <AppText variant="caption" color={colors.text} style={styles.bold}>
          Architect in Bandung
        </AppText>
      </View>
      <FloatingPerson name={andi.name} avatar={andi.avatar} role={andi.profession} style={{ top: 110, left: 12 }} />
      <FloatingPerson name={nadia.name} avatar={nadia.avatar} role={nadia.profession} style={{ top: 170, right: 8 }} />
      <FloatingPerson name={sarah.name} avatar={sarah.avatar} role="Doctor" style={{ bottom: 22, left: 36 }} />
    </>
  );
}

function Repository() {
  const rows = ['Profile', 'Skills', 'Experience', 'Projects', 'Certificates', 'Contact'];
  return (
    <View style={styles.tree}>
      <View style={styles.treeHead}>
        <Avatar uri={andi.avatar} name={andi.name} size={28} />
        <AppText variant="mono" color={colors.primary} style={styles.bold}>
          {andi.handle}
        </AppText>
      </View>
      {rows.map((r, i) => (
        <View key={r} style={styles.treeRow}>
          <AppText variant="mono" color={colors.textSubtle}>
            {i === rows.length - 1 ? '└──' : '├──'}
          </AppText>
          <AppText variant="caption" style={styles.bold}>
            {r}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function Connect() {
  return (
    <>
      <View style={styles.connectRow}>
        <Avatar uri={rizky.avatar} name={rizky.name} size={84} ring />
        <View style={styles.link}>
          <View style={styles.linkLine} />
          <View style={styles.linkBadge}>
            <Ionicons name="link" size={18} color={colors.white} />
          </View>
          <View style={styles.linkLine} />
        </View>
        <Avatar uri={bima.avatar} name={bima.name} size={84} ring />
      </View>
      <View style={styles.connectedPill}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <AppText variant="caption" style={styles.bold}>
          3 mutual connections
        </AppText>
      </View>
    </>
  );
}

export function Illustration({ kind }: { kind: IllustrationKind }) {
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.canvas}>
      {/* soft decorative circles */}
      <View style={[styles.circle, { width: 220, height: 220, top: -60, right: -60 }]} />
      <View style={[styles.circle, { width: 140, height: 140, bottom: -40, left: -30 }]} />
      {kind === 'discover' && <Discover />}
      {kind === 'repository' && <Repository />}
      {kind === 'connect' && <Connect />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 300,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  bold: { fontWeight: '700' },
  tiny: { fontSize: 10 },
  search: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radius.pill,
    ...shadows.lg,
  },
  person: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingLeft: 6,
    paddingRight: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    maxWidth: 190,
    ...shadows.lg,
  },
  tree: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, width: 230, gap: 2, ...shadows.lg },
  treeHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 },
  treeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, height: 26 },
  connectRow: { flexDirection: 'row', alignItems: 'center' },
  link: { flexDirection: 'row', alignItems: 'center' },
  linkLine: { width: 22, height: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  linkBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    ...shadows.lg,
  },
});
