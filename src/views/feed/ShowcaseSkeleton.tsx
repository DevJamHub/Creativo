// Placeholders for Beranda while professionals and their work load: a row of tiles shaped like
// ProfessionalTile, and a grid of squares shaped like PostGrid.

import { StyleSheet, View } from 'react-native';

import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import { Skeleton, SkeletonGroup } from '@/views/ui/Skeleton';

function TileShape() {
  return (
    <View style={styles.tile}>
      <Skeleton width={52} height={52} radius={radius.pill} />
      <Skeleton width="75%" height={16} style={styles.gapTop} />
      <Skeleton width="85%" height={12} />
      <Skeleton width="100%" height={12} style={styles.gapTop} />
      <Skeleton width="60%" height={12} />
      <Skeleton width="40%" height={10} style={styles.gapTop} />
      <Skeleton height={36} radius={radius.pill} style={styles.button} />
    </View>
  );
}

/** Three tiles in a row, running past the right edge like the real list */
export function ProfessionalRowSkeleton() {
  return (
    <SkeletonGroup label="Memuat profesional" style={styles.row}>
      <TileShape />
      <TileShape />
      <TileShape />
    </SkeletonGroup>
  );
}

/** Two columns of square work previews */
export function WorksGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonGroup label="Memuat karya terbaru" style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.cell}>
          <Skeleton height="100%" radius={radius.md} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  // Same edge-to-edge row as the real list (see `bleed` / `pros` in app/(tabs)/home.tsx)
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: -SCREEN_PADDING,
    paddingHorizontal: SCREEN_PADDING,
    overflow: 'hidden',
  },
  tile: {
    width: 168,
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  gapTop: { marginTop: 4 },
  button: { marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -3 },
  cell: { width: '50%', aspectRatio: 1, padding: 3 },
});
