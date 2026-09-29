// Ask before deleting a post. Alert buttons don't exist on web, so the browser's confirm() is used there.

import { Alert, Platform } from 'react-native';

export function confirmDelete(onConfirm: () => void) {
  const title = 'Hapus postingan?';
  const message = 'Postingan dan fotonya akan dihapus permanen.';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus', style: 'destructive', onPress: onConfirm },
  ]);
}
