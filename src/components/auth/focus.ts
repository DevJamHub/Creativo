// Visible keyboard focus ring for Pressables on web (react-native-web passes `focused`).

import { Platform, type PressableStateCallbackType, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

export function focusRing(state: PressableStateCallbackType): ViewStyle | null {
  if (Platform.OS !== 'web' || !(state as { focused?: boolean }).focused) return null;
  return { outlineColor: colors.primary, outlineStyle: 'solid', outlineWidth: 2, outlineOffset: 2 };
}
