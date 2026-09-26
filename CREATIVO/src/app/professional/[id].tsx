// Professional Profile screen (also the target of QR deep links).

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { ProfileView } from '@/components/professional/ProfileView';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/store/AppProvider';
import { useProfessional } from '@/store/hooks';
import { colors } from '@/theme';
import { profileDeepLink } from '@/utils/links';

export default function ProfessionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = useProfessional(id);
  const { state, markViewed } = useApp();
  const isMe = id === state.me.id;

  // Remember this profile for "Recently viewed" on Home
  useEffect(() => {
    if (pro && !isMe) markViewed(pro.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pro?.id]);

  if (!pro) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Not found" />
        <EmptyState icon="person-outline" title="Profile not found" message="This professional may have left Creativo." />
      </View>
    );
  }

  const share = () =>
    Share.share({ message: `${pro.name} · ${pro.profession} on Creativo\n${profileDeepLink(pro.id)}` });

  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <View style={styles.screen}>
      <ProfileView
        pro={pro}
        isMe={isMe}
        topBar={
          <>
            <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={back} />
            <View style={styles.right}>
              <IconButton
                icon="qr-code-outline"
                accessibilityLabel="Show QR card"
                onPress={() => router.push({ pathname: '/qr', params: { id: pro.id } })}
              />
              <IconButton icon="share-outline" accessibilityLabel="Share profile" onPress={share} />
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  right: { flexDirection: 'row', gap: 8 },
});
