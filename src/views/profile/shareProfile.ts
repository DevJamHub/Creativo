// Share a profile like a professional card: name, role, headline, whether they're open to
// opportunities, and a link that opens the profile in Creativo.

import * as Linking from 'expo-linking';
import { Share } from 'react-native';

interface ShareableProfile {
  id: string;
  name: string;
  professionLabel: string;
  level: string | null;
  headline: string | null;
  openToWork: boolean;
}

/** Returns false when this device can't share (e.g. some desktop browsers). */
export async function shareProfile(p: ShareableProfile): Promise<boolean> {
  const link = Linking.createURL(`/user/${p.id}`);
  const lines = [
    p.name,
    `${p.professionLabel}${p.level ? ` · ${p.level}` : ''}`,
    p.headline ? `“${p.headline}”` : null,
    p.openToWork ? '✅ Terbuka untuk peluang kerja & proyek' : null,
    '',
    `Lihat profil profesional dan karya ${p.name.split(' ')[0]} di Creativo:`,
    link,
  ].filter((line) => line !== null);
  try {
    await Share.share({ message: lines.join('\n') });
    return true;
  } catch {
    return false;
  }
}
