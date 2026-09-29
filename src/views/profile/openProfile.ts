// Opens someone's profile page. Your own id lands on the Profil tab (handled by the page itself).

import { router } from 'expo-router';

export function openProfile(userId: string) {
  router.push({ pathname: '/user/[id]', params: { id: userId } });
}
