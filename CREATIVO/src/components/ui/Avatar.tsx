// Profile photo with an initials fallback (used when offline or the image fails).

import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import { colors } from '@/theme';

export interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  ring?: boolean; // white ring, for avatars overlapping a cover or other avatars
  style?: StyleProp<ViewStyle>;
}

const initials = (name: string) =>
  name
    .replace(/^(dr\.|prof\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export function Avatar({ uri, name, size = 48, ring, style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrap, shape, ring && { borderWidth: Math.max(2, size / 22), borderColor: colors.white }, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
          accessibilityLabel={`${name} profile photo`}
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
    backgroundColor: colors.primarySoft,
  },
});
