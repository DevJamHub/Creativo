// Add an item to a section of My Repository (skill, experience, project, ...).
// Fields come from src/config/forms.ts, so new sections need no new screen.

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { FormField } from '@/components/forms/FormField';
import { FormScreen } from '@/components/forms/FormScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { isListSection, sectionForms } from '@/config/forms';
import { getSectionConfig } from '@/config/repository';
import { useApp } from '@/store/AppProvider';
import { newId } from '@/utils/format';

export default function AddItemScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { addItem } = useApp();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isListSection(section)) {
    return <EmptyState icon="alert-circle-outline" title="Unknown section" />;
  }

  const form = sectionForms[section];

  const save = () => {
    // Validate required fields
    const next: Record<string, string> = {};
    form.fields.forEach((f) => {
      if (f.required && !values[f.key]?.trim()) next[f.key] = `${f.label} is required`;
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    addItem(section, form.build(trimmed, newId(section)));
    router.back();
  };

  return (
    <FormScreen title={form.title} subtitle={`Repository / ${getSectionConfig(section).title}`} saveLabel="Add to repository" onSave={save}>
      {form.fields.map((f) => (
        <FormField
          key={f.key}
          field={f}
          value={values[f.key] ?? ''}
          error={errors[f.key]}
          onChange={(v) => setValues((cur) => ({ ...cur, [f.key]: v }))}
        />
      ))}
    </FormScreen>
  );
}
