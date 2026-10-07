// Ask before signing out. Alert buttons don't exist on web, so the browser's confirm() is used there.

import { Alert, Platform } from 'react-native';

export function confirmSignOut(onConfirm: () => void) {
  const title = 'Keluar dari Creativo?';
  const message = 'Sesi login di perangkat ini akan dihapus. Kamu perlu masuk lagi untuk memakai aplikasi.';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Keluar', style: 'destructive', onPress: onConfirm },
  ]);
}
