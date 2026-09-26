// Helpers for opening links, contact channels and profile deep links.

import * as ExpoLinking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';

import type { IconName, LinkType } from '@/types';

export const linkIcons: Record<LinkType, IconName> = {
  github: 'logo-github',
  linkedin: 'logo-linkedin',
  website: 'globe-outline',
  behance: 'logo-behance',
  dribbble: 'logo-dribbble',
  instagram: 'logo-instagram',
  other: 'link-outline',
};

// Open a web page in the in-app browser
export async function openWebLink(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    Alert.alert('Could not open link', url);
  }
}

// Open system handlers such as mailto:, tel: or WhatsApp
export async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Not available', 'No app on this device can open this link.');
  }
}

export const contactUrls = {
  email: (email: string, name: string) => `mailto:${email}?subject=${encodeURIComponent(`Hello ${name} — via Creativo`)}`,
  whatsapp: (number: string, name: string) =>
    `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${name}, I found your repository on Creativo.`)}`,
  phone: (phone: string) => `tel:${phone.replace(/\s/g, '')}`,
};

// Deep link that opens a professional's profile, e.g. creativo://professional/andi
// (in Expo Go this becomes an exp:// URL that works the same way)
export const profileDeepLink = (id: string) => ExpoLinking.createURL(`/professional/${id}`);
