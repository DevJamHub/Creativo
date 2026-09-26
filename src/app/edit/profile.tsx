// Edit profile + manage contact information.

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms/FormField';
import { FormScreen } from '@/components/forms/FormScreen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import type { FieldDef } from '@/config/forms';
import { categories } from '@/data/categories';
import { useApp } from '@/store/AppProvider';
import { colors, spacing } from '@/theme';
import type { CategoryId } from '@/types';

const profileFields: FieldDef[] = [
  { key: 'name', label: 'Full name', required: true },
  { key: 'profession', label: 'Professional title', placeholder: 'e.g. Architect, Web Developer', required: true },
  { key: 'headline', label: 'Short bio', placeholder: 'One sentence shown on your card', multiline: true, required: true },
  { key: 'about', label: 'About', placeholder: 'Tell people about your work', multiline: true },
  { key: 'location', label: 'Location', placeholder: 'City, Country', required: true },
  { key: 'yearsOfExperience', label: 'Years of experience', placeholder: '0', keyboardType: 'phone-pad' },
  { key: 'availability', label: 'Availability', placeholder: 'e.g. Open for freelance projects' },
  { key: 'specializations', label: 'Specializations', placeholder: 'Comma separated', hint: 'Separate with commas' },
];

const contactFields: FieldDef[] = [
  { key: 'email', label: 'Email', keyboardType: 'email-address', required: true },
  { key: 'whatsapp', label: 'WhatsApp number', placeholder: 'e.g. 6281234567890', keyboardType: 'phone-pad', hint: 'Country code without +' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'other', label: 'Other contact', placeholder: 'e.g. Telegram @username' },
];

export default function EditProfileScreen() {
  const { state, updateProfile, updateContact } = useApp();
  const me = state.me;
  const [categoryId, setCategoryId] = useState<CategoryId>(me.categoryId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({
    name: me.name,
    profession: me.profession,
    headline: me.headline,
    about: me.about,
    location: me.location,
    yearsOfExperience: String(me.yearsOfExperience),
    availability: me.availability,
    specializations: me.specializations.join(', '),
    email: me.contact.email,
    whatsapp: me.contact.whatsapp ?? '',
    phone: me.contact.phone ?? '',
    other: me.contact.other ?? '',
  });

  const set = (key: string) => (v: string) => setValues((cur) => ({ ...cur, [key]: v }));
  const v = (key: string) => values[key]?.trim() ?? '';

  const save = () => {
    const next: Record<string, string> = {};
    [...profileFields, ...contactFields].forEach((f) => {
      if (f.required && !v(f.key)) next[f.key] = `${f.label} is required`;
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    updateProfile({
      name: v('name'),
      profession: v('profession'),
      categoryId,
      headline: v('headline'),
      about: v('about'),
      location: v('location'),
      availability: v('availability'),
      yearsOfExperience: Number(v('yearsOfExperience')) || 0,
      specializations: v('specializations').split(',').map((s) => s.trim()).filter(Boolean),
    });
    updateContact({
      email: v('email'),
      whatsapp: v('whatsapp') || undefined,
      phone: v('phone') || undefined,
      other: v('other') || undefined,
    });
    router.back();
  };

  const renderFields = (fields: FieldDef[]) =>
    fields.map((f) => <FormField key={f.key} field={f} value={values[f.key] ?? ''} onChange={set(f.key)} error={errors[f.key]} />);

  return (
    <FormScreen title="Edit profile" subtitle="Repository / Profile & Contact" onSave={save}>
      <View style={styles.avatarRow}>
        <Avatar uri={me.avatar} name={me.name} size={72} />
        <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
          Photo upload will arrive with the backend. For now your mock photo is used.
        </AppText>
      </View>

      {renderFields(profileFields.slice(0, 2))}

      <View style={styles.group}>
        <AppText variant="caption" style={styles.bold}>
          Field
        </AppText>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip key={c.id} label={c.name} icon={c.icon} size="sm" color={c.color} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
          ))}
        </View>
      </View>

      {renderFields(profileFields.slice(2))}

      <AppText variant="h3" style={styles.sectionTitle}>
        Contact information
      </AppText>
      {renderFields(contactFields)}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  group: { gap: 6 },
  bold: { fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sectionTitle: { marginTop: spacing.md },
});
