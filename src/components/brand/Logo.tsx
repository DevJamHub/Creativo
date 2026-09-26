// Creativo logo: a gradient "C" mark with a node dot (people connected), plus the wordmark.

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, gradients } from '@/theme';

export interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  light?: boolean; // white wordmark for dark backgrounds
}

export function LogoMark({ size = 36 }: { size?: number }) {
  const ring = size * 0.56;
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {/* The "C": a thick ring with a gap on the right */}
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: size * 0.11,
          borderColor: colors.white,
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
    </LinearGradient>
  );
}

export function Logo({ size = 36, showWordmark = true, light }: LogoProps) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      {showWordmark && (
        <AppText variant="h2" color={light ? colors.white : colors.ink} style={[styles.word, { fontSize: size * 0.62 }]}>
          creativo
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', backgroundColor: colors.white },
  word: { fontWeight: '800', letterSpacing: -0.8 },
});
