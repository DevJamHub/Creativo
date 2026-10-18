// Loading placeholders: grey shapes in the layout of the content that is on its way, gently pulsing.
// Wrap shapes in <SkeletonGroup> so they pulse together; it also tells screen readers what is loading.
// The pulse stops when the device asks for reduced motion.

import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius as radii } from '@/theme';

interface SkeletonGroupProps {
  /** Read by screen readers, e.g. "Memuat profesional" */
  label: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function SkeletonGroup({ label, style, children }: SkeletonGroupProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (active && !reduce) pulse.start();
    });
    return () => {
      active = false;
      pulse.stop();
    };
  }, [opacity]);

  return (
    <Animated.View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={{ opacity }}>
      {/* The shapes themselves mean nothing to a screen reader */}
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={style}>
        {children}
      </View>
    </Animated.View>
  );
}

interface SkeletonProps {
  width?: DimensionValue;
  height: DimensionValue;
  /** Corner radius; use radius.pill for avatars and buttons */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** One grey shape (a line of text, an avatar, an image...) */
export function Skeleton({ width = '100%', height, radius = radii.sm, style }: SkeletonProps) {
  return <View style={[styles.shape, { width, height, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  shape: { backgroundColor: colors.surfaceAlt },
});
