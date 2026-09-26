// Professional Card: the main result item in discovery and search.
// Shows photo, name, profession, short description, main skills, location,
// project count, connection status and a "View Repository" action.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ConnectButton } from './ConnectButton';
import { MutualConnections } from './MutualConnections';
import { StatusPill } from './StatusPill';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { getCategory } from '@/data/categories';
import { useConnectionStatus } from '@/store/hooks';
import { colors, radius, spacing } from '@/theme';
import type { Professional } from '@/types';

export interface ProfessionalCardProps {
  pro: Professional;
  reasons?: string[]; // search match reasons, shown as a hint
}

export function ProfessionalCard({ pro, reasons }: ProfessionalCardProps) {
  const status = useConnectionStatus(pro.id);
  const category = getCategory(pro.categoryId);
  const openProfile = () => router.push({ pathname: '/professional/[id]', params: { id: pro.id } });
  const matchHint = reasons?.find((r) => r !== 'all' && r !== 'Name');

  return (
    <Card onPress={openProfile} style={styles.card}>
      {/* Header: photo, name, profession */}
      <View style={styles.header}>
        <Avatar uri={pro.avatar} name={pro.name} size={56} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <AppText variant="h3" numberOfLines={1} style={styles.shrink}>
              {pro.name}
            </AppText>
            {pro.verified && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
          </View>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {pro.profession}
          </AppText>
          <View style={styles.metaRow}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <AppText variant="small" color={category.color} style={styles.bold}>
              {category.name}
            </AppText>
          </View>
        </View>
        <StatusPill status={status} />
      </View>

      <AppText variant="body" color={colors.text} numberOfLines={2}>
        {pro.headline}
      </AppText>

      {/* Main skills */}
      <View style={styles.skills}>
        {pro.skills.slice(0, 3).map((s) => (
          <Chip key={s.id} label={s.name} size="sm" tint={colors.surfaceAlt} color={colors.text} />
        ))}
        {pro.skills.length > 3 && <Chip label={`+${pro.skills.length - 3}`} size="sm" tint={colors.surfaceAlt} color={colors.textMuted} />}
      </View>

      {/* Location + project count */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
            {pro.location}
          </AppText>
        </View>
        <View style={styles.stat}>
          <Ionicons name="layers-outline" size={14} color={colors.textMuted} />
          <AppText variant="small" color={colors.textMuted}>
            {pro.projects.length} projects
          </AppText>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <AppText variant="small" color={colors.textMuted}>
            {pro.yearsOfExperience} yrs
          </AppText>
        </View>
      </View>

      {matchHint && (
        <View style={styles.match}>
          <Ionicons name="sparkles" size={12} color={colors.primary} />
          <AppText variant="small" color={colors.primary} numberOfLines={1}>
            Matched {matchHint}
          </AppText>
        </View>
      )}

      <MutualConnections pro={pro} compact />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="View Repository"
          icon="folder-open-outline"
          variant="dark"
          size="sm"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/repository/[id]', params: { id: pro.id } })}
        />
        {status !== 'incoming' && <ConnectButton pro={pro} size="sm" />}
      </View>
      {status === 'incoming' && <ConnectButton pro={pro} size="sm" fullWidth />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerText: { flex: 1, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  bold: { fontWeight: '700' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  match: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  flex: { flex: 1 },
});
