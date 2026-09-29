// Profile photo with an initials fallback (used when there is no photo or it fails to load).

import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import { colors } from '@/theme';

export interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  ring?: boolean; // canvas-colored ring, for avatars overlapping a cover
  style?: StyleProp<ViewStyle>;
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

export function Avatar({ uri, name, size = 48, ring, style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrap, shape, ring && { borderWidth: Math.max(3, size / 20), borderColor: colors.background }, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
          accessibilityLabel={`Foto profil ${name}`}
        />
      ) : (
        <AppText variant="bodyStrong" color={colors.primary} style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
});
