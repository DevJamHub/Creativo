// Onboarding ("introduction mode"), shown after sign-up / sign-in until it is finished once:
// welcome → what do you do → focus & experience → one-line intro. Answers are saved to the profile,
// which tailors the dashboard. Finishing flips the guard in the root layout, which opens the app.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/views/auth/AuthInput';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { Logo } from '@/views/brand/Logo';
import { ProfessionTile } from '@/views/onboarding/ProfessionTile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { Chip } from '@/views/ui/Chip';
import { IconButton } from '@/views/ui/IconButton';
import {
  experienceLabel,
  experienceLevels,
  getProfession,
  professions,
  type ExperienceLevel,
  HEADLINE_MAX,
  MAX_FOCUS,
} from '@/models/profession';
import { useAuthContext } from '@/controllers/AuthProvider';
import type { IconName } from '@/models/icon';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';

const STEPS = ['intro', 'profession', 'focus', 'headline'] as const;
type Step = (typeof STEPS)[number];


const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'grid-outline',
    title: 'Dasbor sesuai profesimu',
    text: 'Statistik, pintasan, dan bagian yang disesuaikan dengan pekerjaanmu.',
  },
  {
    icon: 'images-outline',
    title: 'Feed untuk karyamu',
    text: 'Bagikan screenshot, shot, dan proyek ke komunitas.',
  },
  {
    icon: 'people-outline',
    title: 'Relasi profesionalmu',
    text: 'Temukan teman dan orang-orang di bidangmu.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, saveOnboarding, pending } = useAuthContext();

  // "Change profession" sends people back here, so start from what they already chose
  const [step, setStep] = useState<Step>(profile?.profession ? 'profession' : 'intro');
  const [professionId, setProfessionId] = useState<string | null>(profile?.profession ?? null);
  const [focus, setFocus] = useState<string[]>(profile?.specializations ?? []);
  const [level, setLevel] = useState<ExperienceLevel | null>(profile?.experience_level ?? null);
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [error, setError] = useState<string | null>(null);

  const name = profile?.full_name || user?.email?.split('@')[0] || 'kamu';
  const firstName = name.split(' ')[0];
  const profession = professionId ? getProfession(professionId) : null;
  const stepIndex = STEPS.indexOf(step);
  const saving = pending === 'profile';

  const goBack = () => setStep(STEPS[Math.max(0, stepIndex - 1)]);
  const goNext = () => setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)]);

  function pickProfession(id: string) {
    setProfessionId(id);
    // Specializations belong to a profession; drop ones the new profession doesn't offer
    const offered = getProfession(id).focus;
    setFocus((cur) => cur.filter((f) => offered.includes(f)));
  }

  function toggleFocus(item: string) {
    setFocus((cur) =>
      cur.includes(item) ? cur.filter((f) => f !== item) : cur.length < MAX_FOCUS ? [...cur, item] : cur,
    );
  }

  async function finish() {
    if (!professionId || !level) return;
    setError(null);
    const result = await saveOnboarding({
      profession: professionId,
      specializations: focus,
      experience_level: level,
      headline: headline.trim() || null,
    });
    // On success the root layout swaps onboarding for the app by itself
    if (result?.error) setError(result.error);
  }

  const canContinue =
    step === 'intro' || (step === 'profession' && !!professionId) || (step === 'focus' && focus.length > 0 && !!level);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      {/* Top bar: back + progress */}
      <View style={styles.topBar}>
        {stepIndex > 0 ? (
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={goBack} />
        ) : (
          <Logo size={28} showWordmark={false} />
        )}
        <View style={styles.progress} accessibilityLabel={`Langkah ${stepIndex + 1} dari ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressBar, i <= stepIndex && styles.progressBarDone]} />
          ))}
        </View>
        <AppText variant="caption" color={colors.textMuted} style={styles.stepCount}>
          {stepIndex + 1}/{STEPS.length}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View key={step} entering={FadeIn.duration(250)} style={styles.stepBody}>
          {step === 'intro' && (
            <>
              <AppText variant="overline" color={colors.primary}>
                Perkenalan
              </AppText>
              <AppText variant="display" color={colors.ink} accessibilityRole="header">
                Hai {firstName},{'\n'}selamat datang di Creativo.
              </AppText>
              <AppText variant="body" color={colors.textMuted}>
                Sebelum mulai, ceritakan sedikit tentang pekerjaanmu. Kami akan menyiapkan ruang kerja yang sesuai
                dengan pekerjaanmu. Cuma butuh kurang dari satu menit.
              </AppText>
              <View style={styles.features}>
                {features.map((f) => (
                  <View key={f.title} style={styles.feature}>
                    <View style={styles.featureIcon}>
                      <Ionicons name={f.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="bodyStrong" color={colors.ink}>
                        {f.title}
                      </AppText>
                      <AppText variant="caption" color={colors.textMuted}>
                        {f.text}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 'profession' && (
            <>
              <AppText variant="display" color={colors.ink} accessibilityRole="header">
                Apa pekerjaanmu?
              </AppText>
              <AppText variant="body" color={colors.textMuted}>
                Pilih yang paling mendekati pekerjaanmu. Dasbor kamu akan disesuaikan, dan kamu bisa mengubahnya nanti.
              </AppText>
              <View style={styles.grid} accessibilityRole="radiogroup">
                {professions.map((p) => (
                  <View key={p.id} style={styles.gridCell}>
                    <ProfessionTile
                      profession={p}
                      selected={professionId === p.id}
                      onPress={() => pickProfession(p.id)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 'focus' && profession && (
            <>
              <AppText variant="display" color={colors.ink} accessibilityRole="header">
                Apa fokus kamu?
              </AppText>
              <AppText variant="body" color={colors.textMuted}>
                Pilih maksimal {MAX_FOCUS}. Pilihan ini tampil di profilmu dan membentuk dasbor kamu.
              </AppText>
              <View style={styles.chips}>
                {profession.focus.map((f) => (
                  <Chip key={f} label={f} selected={focus.includes(f)} onPress={() => toggleFocus(f)} />
                ))}
              </View>
              <AppText variant="small" color={colors.textSubtle}>
                {focus.length}/{MAX_FOCUS} dipilih
              </AppText>

              <AppText variant="h3" color={colors.ink} style={styles.subheading}>
                Tingkat pengalaman
              </AppText>
              <View style={styles.levels} accessibilityRole="radiogroup">
                {experienceLevels.map((l) => {
                  const active = level === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      onPress={() => setLevel(l.id)}
                      style={(state) => [styles.level, active && styles.levelActive, focusRing(state)]}>
                      <View style={styles.flex}>
                        <AppText variant="bodyStrong" color={colors.ink}>
                          {l.label}
                        </AppText>
                        <AppText variant="small" color={colors.textMuted}>
                          {l.hint}
                        </AppText>
                      </View>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={active ? colors.primary : colors.borderStrong}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 'headline' && profession && (
            <>
              <AppText variant="display" color={colors.ink} accessibilityRole="header">
                Perkenalkan dirimu
              </AppText>
              <AppText variant="body" color={colors.textMuted}>
                Satu kalimat yang dilihat orang di profilmu. Kamu bisa melewati ini dulu.
              </AppText>
              <AuthInput
                label="Headline"
                placeholder={profession.headlinePlaceholder}
                value={headline}
                onChangeText={setHeadline}
                maxLength={HEADLINE_MAX}
                autoCapitalize="sentences"
                returnKeyType="done"
                onSubmitEditing={finish}
              />
              <AppText variant="small" color={colors.textSubtle} align="right">
                {headline.length}/{HEADLINE_MAX}
              </AppText>

              {/* Live preview of the profile card others will see */}
              <AppText variant="overline" color={colors.textMuted} style={styles.subheading}>
                Pratinjau
              </AppText>
              <View style={styles.preview}>
                <View style={styles.previewTop}>
                  <Avatar uri={profile?.avatar_url} name={name} size={52} />
                  <View style={styles.flex}>
                    <AppText variant="h3" color={colors.ink} numberOfLines={1}>
                      {name}
                    </AppText>
                    <View style={styles.previewRole}>
                      <Ionicons name={profession.icon} size={13} color={profession.color} />
                      <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                        {profession.label}
                        {level ? ` · ${experienceLabel(level)}` : ''}
                      </AppText>
                    </View>
                  </View>
                </View>
                <AppText variant="body" color={headline.trim() ? colors.text : colors.textSubtle}>
                  {headline.trim() || profession.headlinePlaceholder}
                </AppText>
                {focus.length > 0 && (
                  <View style={styles.chips}>
                    {focus.map((f) => (
                      <Chip key={f} label={f} size="sm" />
                    ))}
                  </View>
                )}
              </View>

              <ErrorBanner message={error} />
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {step === 'headline' && profession ? (
          <Button
            label={`Masuk ke ${profession.workspace}`}
            iconRight="arrow-forward"
            size="lg"
            loading={saving}
            onPress={finish}
          />
        ) : (
          <Button
            label={step === 'intro' ? 'Ayo mulai' : 'Lanjut'}
            iconRight="arrow-forward"
            size="lg"
            disabled={!canContinue}
            onPress={goNext}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.md,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressBarDone: { backgroundColor: colors.primary },
  stepCount: { minWidth: 28, textAlign: 'right' },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  stepBody: { gap: spacing.sm },
  features: { gap: spacing.md, marginTop: spacing.xl },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginTop: spacing.md },
  gridCell: { width: '50%', padding: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  subheading: { marginTop: spacing.xl },
  levels: { gap: spacing.xs },
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  levelActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  preview: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  previewRole: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
});
