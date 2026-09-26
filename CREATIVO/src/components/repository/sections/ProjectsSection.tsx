// Projects: name, description, role, tools, link and images.

import { Image } from 'expo-image';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { EmptySection, ItemShell, take, type SectionProps } from './shared';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { colors, SCREEN_PADDING, spacing } from '@/theme';
import type { Project } from '@/types';
import { openWebLink } from '@/utils/links';

const COMPACT_WIDTH = 260;

export function ProjectCard({ project, compact }: { project: Project; compact?: boolean }) {
  // Images fill the card width so the gallery pages one image at a time
  const { width } = useWindowDimensions();
  const imageWidth = compact ? COMPACT_WIDTH : width - SCREEN_PADDING * 2 - 2; // minus the 1px card border on each side
  return (
    <Card padded={false} style={styles.card}>
      {/* Image gallery */}
      {project.images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {project.images.map((uri) => (
            <Image key={uri} source={{ uri }} style={[styles.image, { width: imageWidth }, compact && styles.imageCompact]} contentFit="cover" transition={200} />
          ))}
        </ScrollView>
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="h3" style={styles.flex} numberOfLines={1}>
            {project.name}
          </AppText>
          <AppText variant="small" color={colors.textMuted}>
            {project.year}
          </AppText>
        </View>
        <AppText variant="small" color={colors.primary} style={styles.role}>
          {project.role}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={compact ? 2 : undefined}>
          {project.description}
        </AppText>
        {project.tools.length > 0 && (
          <View style={styles.tools}>
            {project.tools.slice(0, compact ? 3 : undefined).map((t) => (
              <Chip key={t} label={t} size="sm" tint={colors.surfaceAlt} color={colors.text} />
            ))}
          </View>
        )}
        {project.link && !compact && (
          <Button
            label="Open project"
            icon="open-outline"
            variant="soft"
            size="sm"
            onPress={() => openWebLink(project.link!)}
            style={styles.linkBtn}
          />
        )}
      </View>
    </Card>
  );
}

export function ProjectsSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.projects.length === 0) return <EmptySection text="No projects added yet" />;

  // Preview mode: horizontal carousel
  if (limit) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {take(pro.projects, limit).map((p) => (
          <View key={p.id} style={styles.carouselItem}>
            <ProjectCard project={p} compact />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.list}>
      {pro.projects.map((p) => (
        <ItemShell key={p.id} onRemove={onRemove && (() => onRemove(p.id))}>
          <ProjectCard project={p} />
        </ItemShell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  gallery: { flexGrow: 0 },
  image: { height: 190, backgroundColor: colors.surfaceAlt },
  imageCompact: { height: 130 },
  body: { padding: spacing.md, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1 },
  role: { fontWeight: '700' },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  linkBtn: { alignSelf: 'flex-start', marginTop: spacing.xs },
  list: { gap: spacing.md },
  carousel: { gap: spacing.sm, paddingRight: spacing.lg },
  carouselItem: { width: COMPACT_WIDTH },
});
