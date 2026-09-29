// Creativo logo: a lime tile holding a "C" ring with a node dot (people connected), plus the wordmark.

import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from '@/views/ui/AppText';

export interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  /** Kept for older call sites; the wordmark is always light on the dark theme */
  light?: boolean;
}

export function LogoMark({ size = 36 }: { size?: number }) {
  const ring = size * 0.56;
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {/* The "C": a thick ring with a gap on the right */}
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: size * 0.12,
          borderColor: colors.onPrimary,
          borderRightColor: 'transparent',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {/* The node: a connection point inside the C */}
      <View
        style={[
          styles.dot,
          { width: size * 0.16, height: size * 0.16, borderRadius: size * 0.08, right: size * 0.2, top: size * 0.42 },
        ]}
      />
    </View>
  );
}

export function Logo({ size = 36, showWordmark = true }: LogoProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel="Creativo">
      <LogoMark size={size} />
      {showWordmark && (
        <AppText variant="h2" color={colors.ink} style={[styles.word, { fontSize: size * 0.62, lineHeight: size * 0.8 }]}>
          creativo
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  dot: { position: 'absolute', backgroundColor: colors.onPrimary },
  word: { fontWeight: '800', letterSpacing: -0.8 },
});
