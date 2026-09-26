// Certificates, Organizations and Achievements: simple credential-style lists.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { EmptySection, IconRow, ItemShell, take, type SectionProps } from './shared';

import { colors, spacing } from '@/theme';
import { openWebLink } from '@/utils/links';

export function CertificatesSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.certificates.length === 0) return <EmptySection text="No certificates added yet" />;
  return (
    <View style={styles.list}>
      {take(pro.certificates, limit).map((c) => (
        <ItemShell key={c.id} onRemove={onRemove && (() => onRemove(c.id))}>
          <IconRow
            icon="ribbon"
            tint={colors.amberSoft}
            color={colors.amber}
            title={c.name}
            lines={[c.issuer, `Issued ${c.date}`, c.credentialUrl ? 'Tap to view credential' : undefined]}
            onPress={c.credentialUrl ? () => openWebLink(c.credentialUrl!) : undefined}
            right={c.credentialUrl && !onRemove ? <Ionicons name="open-outline" size={16} color={colors.primary} /> : undefined}
          />
        </ItemShell>
      ))}
    </View>
  );
}

export function OrganizationsSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.organizations.length === 0) return <EmptySection text="No organizations added yet" />;
  return (
    <View style={styles.list}>
      {take(pro.organizations, limit).map((o) => (
        <ItemShell key={o.id} onRemove={onRemove && (() => onRemove(o.id))}>
          <IconRow icon="people" tint={colors.mintSoft} color={colors.mint} title={o.name} lines={[o.role, o.duration]} />
        </ItemShell>
      ))}
    </View>
  );
}

export function AchievementsSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.achievements.length === 0) return <EmptySection text="No achievements added yet" />;
  return (
    <View style={styles.list}>
      {take(pro.achievements, limit).map((a) => (
        <ItemShell key={a.id} onRemove={onRemove && (() => onRemove(a.id))}>
          <IconRow
            icon="trophy"
            tint={colors.accentSoft}
            color={colors.accent}
            title={a.title}
            lines={[`${a.issuer} · ${a.year}`, a.description]}
          />
        </ItemShell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
});
