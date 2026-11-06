// Ask before signing out. Alert buttons don't exist on web, so the browser's confirm() is used there.

import { Alert, Platform } from 'react-native';

export function confirmSignOut(onConfirm: () => void) {
  const title = 'Keluar';
  const message = 'Apakah kamu yakin ingin keluar? Token login di perangkat ini akan dihapus dan kamu perlu masuk lagi.';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Keluar', style: 'destructive', onPress: onConfirm },
  ]);
}
