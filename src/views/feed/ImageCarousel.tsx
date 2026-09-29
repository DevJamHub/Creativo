// Swipeable square photos with page dots, like an Instagram post. Double-tap a photo to like it.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

interface ImageCarouselProps {
  uris: string[];
  /** Accessible description, e.g. "Postingan dari Sigit" */
  label: string;
  /** Called on a double tap, e.g. to like the post */
  onDoubleTap?: () => void;
}

const DOUBLE_TAP_MS = 280;

export function ImageCarousel({ uris, label, onDoubleTap }: ImageCarouselProps) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [burst, setBurst] = useState(0); // bumps on each double tap to replay the heart
  const lastTap = useRef(0);
  const many = uris.length > 1;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };
  const onTap = () => {
    const now = Date.now();
    if (onDoubleTap && now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onDoubleTap();
      setBurst((b) => b + 1);
    } else {
      lastTap.current = now;
    }
  };

  return (
    <View onLayout={onLayout} style={styles.frame}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          scrollEnabled={many}>
          {uris.map((uri, i) => (
            <Pressable key={uri} onPress={onTap} accessibilityHint={onDoubleTap ? 'Ketuk dua kali untuk menyukai' : undefined}>
              <Image
                source={{ uri }}
                style={{ width, height: width }}
                contentFit="cover"
                transition={200}
                accessibilityLabel={many ? `${label}, foto ${i + 1} dari ${uris.length}` : label}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {burst > 0 && <HeartBurst key={burst} />}

      {many && (
        <>
          <View style={styles.counter}>
            <AppText variant="small" color={colors.white}>
              {page + 1}/{uris.length}
            </AppText>
          </View>
          <View style={styles.dots} pointerEvents="none">
            {uris.map((uri, i) => (
              <View key={uri} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

/** Big heart that pops in and fades away after a double tap. */
function HeartBurst() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.burst} pointerEvents="none">
      {visible && (
        <Animated.View entering={ZoomIn.duration(220)} exiting={FadeOut.duration(250)}>
          <Ionicons name="heart" size={96} color={colors.white} style={styles.burstIcon} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  counter: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(25, 25, 24, 0.6)',
  },
  dots: { position: 'absolute', bottom: spacing.sm, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.55)' },
  dotActive: { backgroundColor: colors.white },
  burst: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  burstIcon: { textShadowColor: 'rgba(0, 0, 0, 0.25)', textShadowRadius: 12 },
});
