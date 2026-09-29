// Edit profil (modal): photo, name, bio, profession, experience level, focus, and whether you're
// open to opportunities (shown to recruiters, like LinkedIn's #OpenToWork).
// A new photo is uploaded first, then everything is saved to the profile row in one update.

import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AuthInput } from '@/views/auth/AuthInput';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { Chip } from '@/views/ui/Chip';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';
import {
  experienceLevels,
  getProfession,
  HEADLINE_MAX,
  MAX_FOCUS,
  professions,
  type ExperienceLevel,
} from '@/models/profession';
import { useAuthContext } from '@/controllers/AuthProvider';
import type { LocalImage } from '@/models/post';
import { uploadAvatar } from '@/services/posts.service';
import { colors, radius, spacing } from '@/theme';

const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.labelRow}>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {children}
      </AppText>
      {hint && (
        <AppText variant="mono" color={colors.textSubtle} style={styles.hint}>
          {hint}
        </AppText>
      )}
    </View>
  );
}

export default function EditProfileScreen() {
  const { profile, user, updateProfile, pending } = useAuthContext();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [professionId, setProfessionId] = useState(profile?.profession ?? 'other');
  const [level, setLevel] = useState<ExperienceLevel | null>(profile?.experience_level ?? null);
  const [focus, setFocus] = useState<string[]>(profile?.specializations ?? []);
  const [openToWork, setOpenToWork] = useState(profile?.open_to_work ?? false);
  const [newPhoto, setNewPhoto] = useState<LocalImage | null>(null);
  const [nameError, setNameError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const profession = getProfession(professionId);
  const saving = uploading || pending === 'profile';
  const displayName = fullName.trim() || user?.email?.split('@')[0] || 'Kamu';

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setNewPhoto({ uri: asset.uri, mimeType: asset.mimeType });
  }

  function pickProfession(id: string) {
    setProfessionId(id);
    // Keep only the focus areas the new profession offers
    const offered = getProfession(id).focus;
    setFocus((cur) => cur.filter((f) => offered.includes(f)));
  }

  function toggleFocus(item: string) {
    setFocus((cur) =>
      cur.includes(item) ? cur.filter((f) => f !== item) : cur.length < MAX_FOCUS ? [...cur, item] : cur,
    );
  }

  async function save() {
    if (!profile || !user || saving) return;
    setError(null);
    if (!fullName.trim()) {
      setNameError('Nama wajib diisi.');
      return;
    }

    let avatarUrl = profile.avatar_url;
    if (newPhoto) {
      setUploading(true);
      const upload = await uploadAvatar(user.id, newPhoto);
      setUploading(false);
      if (upload.error !== null) {
        setError(upload.error);
        return;
      }
      avatarUrl = upload.data;
    }

    const result = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      profession: professionId,
      specializations: focus,
      experience_level: level,
      headline: headline.trim() || null,
      open_to_work: openToWork,
    });
    if (!result) return;
    if (result.error) setError(result.error);
    else close();
  }

  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton icon="close" accessibilityLabel="Batal" size={40} onPress={close} />
          <AppText variant="h3" color={colors.ink} style={styles.title} accessibilityRole="header">
            Edit profil
          </AppText>
          <Button label="Simpan" size="sm" loading={saving} onPress={save} />
        </View>
      }>
      {/* Photo */}
      <View style={styles.photo}>
        <Avatar uri={newPhoto?.uri ?? profile?.avatar_url} name={displayName} size={96} />
        <Pressable accessibilityRole="button" onPress={pickPhoto} hitSlop={8} style={focusRing}>
          <AppText variant="bodyStrong" color={colors.primary}>
            {profile?.avatar_url || newPhoto ? 'Ganti foto profil' : 'Tambah foto profil'}
          </AppText>
        </Pressable>
      </View>

      <AuthInput
        label="Nama"
        placeholder="Nama lengkap kamu"
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        value={fullName}
        onChangeText={(t) => {
          setFullName(t);
          if (nameError) setNameError(undefined);
        }}
        error={nameError}
      />

      <View>
        <AuthInput
          label="Bio"
          placeholder={profession.headlinePlaceholder}
          value={headline}
          onChangeText={setHeadline}
          maxLength={HEADLINE_MAX}
          multiline
          autoCapitalize="sentences"
        />
        <AppText variant="mono" color={colors.textSubtle} align="right" style={styles.counter}>
          {headline.length}/{HEADLINE_MAX}
        </AppText>
      </View>

      <View style={styles.group}>
        <FieldLabel>Profesi</FieldLabel>
        <View style={styles.chips}>
          {professions.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              icon={p.icon}
              size="sm"
              color={p.color}
              tint={p.tint}
              selected={professionId === p.id}
              onPress={() => pickProfession(p.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <FieldLabel>Tingkat pengalaman</FieldLabel>
        <View style={styles.chips}>
          {experienceLevels.map((l) => (
            <Chip key={l.id} label={l.label} size="sm" selected={level === l.id} onPress={() => setLevel(l.id)} />
          ))}
        </View>
      </View>

      {/* Open to opportunities */}
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: openToWork }}
        onPress={() => setOpenToWork((v) => !v)}
        style={(state) => [styles.openCard, openToWork && styles.openCardOn, focusRing(state)]}>
        <View style={styles.openText}>
          <AppText variant="bodyStrong" color={colors.ink}>
            Terbuka untuk peluang
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Tampilkan bingkai hijau di fotomu dan muncul di filter &quot;Siap direkrut&quot; untuk recruiter.
          </AppText>
        </View>
        <Switch
          value={openToWork}
          onValueChange={setOpenToWork}
          trackColor={{ false: colors.borderStrong, true: colors.success }}
          thumbColor={colors.white}
          accessibilityLabel="Terbuka untuk peluang"
        />
      </Pressable>

      <View style={styles.group}>
        <FieldLabel hint={`${focus.length}/${MAX_FOCUS}`}>Fokus</FieldLabel>
        <View style={styles.chips}>
          {profession.focus.map((f) => (
            <Chip
              key={f}
              label={f}
              size="sm"
              color={profession.color}
              tint={profession.tint}
              selected={focus.includes(f)}
              onPress={() => toggleFocus(f)}
            />
          ))}
        </View>
      </View>

      <ErrorBanner message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, textAlign: 'center' },
  photo: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  counter: { marginTop: spacing.xxs },
  group: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, fontWeight: '600' },
  hint: { fontSize: 11, lineHeight: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  openCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  openCardOn: { borderColor: colors.success, backgroundColor: colors.successSoft },
  openText: { flex: 1, gap: 2 },
});
