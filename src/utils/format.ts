// Small text formatting helpers.

import type { Experience } from '@/types';

// "dr. Sarah Wijaya" -> "Sarah"
export const firstName = (name: string) => name.replace(/^(dr\.|prof\.)\s*/i, '').split(' ')[0];

export const formatPeriod = (e: Pick<Experience, 'startDate' | 'endDate'>) => `${e.startDate} – ${e.endDate ?? 'Present'}`;

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Unique id for items created in "My Repository"
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
