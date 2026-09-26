// Connect / Requested / Accept / Connected button driven by the connection status.

import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/AppProvider';
import { useConnectionStatus } from '@/store/hooks';
import type { Professional } from '@/types';
import { firstName } from '@/utils/format';

export interface ConnectButtonProps {
  pro: Professional;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

// Ask before destructive actions (Alert buttons aren't supported on web)
function confirm(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

export function ConnectButton({ pro, size = 'md', fullWidth }: ConnectButtonProps) {
  const status = useConnectionStatus(pro.id);
  const { connect, cancelRequest, acceptRequest, declineRequest, removeConnection } = useApp();
  const flex = fullWidth ? styles.flex : undefined;

  switch (status) {
    case 'connected':
      return (
        <Button
          label="Connected"
          icon="checkmark-circle"
          variant="outline"
          size={size}
          style={flex}
          onPress={() =>
            confirm('Remove connection?', `${pro.name} will be removed from your network.`, 'Remove', () =>
              removeConnection(pro.id),
            )
          }
        />
      );
    case 'outgoing':
      return (
        <Button
          label="Requested"
          icon="time-outline"
          variant="soft"
          size={size}
          style={flex}
          onPress={() =>
            confirm('Cancel request?', `Withdraw your connection request to ${firstName(pro.name)}?`, 'Withdraw', () =>
              cancelRequest(pro.id),
            )
          }
        />
      );
    case 'incoming':
      return (
        <View style={[styles.row, flex]}>
          <Button label="Accept" icon="checkmark" size={size} style={styles.flex} onPress={() => acceptRequest(pro.id)} />
          <Button label="Ignore" variant="outline" size={size} onPress={() => declineRequest(pro.id)} />
        </View>
      );
    default:
      return (
        <Button label="Connect" icon="person-add-outline" size={size} style={flex} onPress={() => connect(pro.id)} />
      );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
