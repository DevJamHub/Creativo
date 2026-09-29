// Follow button with LinkedIn-style states:
// Ikuti → Mengikuti (one-way), Ikuti balik (they follow you) → Terhubung (you're koneksi).

import { useAuthContext } from '@/controllers/AuthProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { Button } from '@/views/ui/Button';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  onError?: (message: string) => void;
}

export function FollowButton({ userId, size = 'sm', fullWidth, onError }: FollowButtonProps) {
  const { user } = useAuthContext();
  const { relation, toggleFollow } = useSocial();
  if (!user || user.id === userId) return null;

  const state = relation(userId);
  const look = {
    connected: { label: 'Terhubung', icon: 'people', variant: 'secondary' },
    following: { label: 'Mengikuti', icon: 'checkmark', variant: 'secondary' },
    follower: { label: 'Ikuti balik', icon: 'person-add-outline', variant: 'primary' },
    none: { label: 'Ikuti', icon: 'person-add-outline', variant: 'primary' },
  } as const;

  return (
    <Button
      label={look[state].label}
      icon={look[state].icon}
      variant={look[state].variant}
      accessibilityHint={state === 'connected' || state === 'following' ? 'Ketuk untuk berhenti mengikuti' : undefined}
      size={size}
      fullWidth={fullWidth}
      onPress={async () => {
        const result = await toggleFollow(userId);
        if (result.error) onError?.(result.error);
      }}
    />
  );
}
