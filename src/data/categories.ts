// Professional categories used by onboarding, discovery and search.

import type { Category, CategoryId } from '@/types';

export const categories: Category[] = [
  {
    id: 'it',
    name: 'IT & Technology',
    icon: 'code-slash',
    color: '#5B3DF5',
    tint: '#EFEBFF',
    description: 'Developers, engineers, data & cloud specialists',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: 'business',
    color: '#E86A33',
    tint: '#FFEFE6',
    description: 'Architects, interior & landscape designers',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'medkit',
    color: '#E5484D',
    tint: '#FDECEC',
    description: 'Doctors, nurses, therapists & health experts',
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'briefcase',
    color: '#0F766E',
    tint: '#E0F4F1',
    description: 'Consultants, founders, strategists & managers',
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'color-palette',
    color: '#D9368B',
    tint: '#FDE8F3',
    description: 'UI/UX, product, brand & graphic designers',
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: 'construct',
    color: '#2563EB',
    tint: '#E6EEFF',
    description: 'Civil, mechanical, electrical & industrial engineers',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    color: '#7C3AED',
    tint: '#F1EAFE',
    description: 'Lecturers, teachers, tutors & trainers',
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: 'document-text',
    color: '#475569',
    tint: '#EDF0F4',
    description: 'Lawyers, notaries & legal consultants',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'trending-up',
    color: '#16A34A',
    tint: '#E5F6EB',
    description: 'Analysts, accountants & financial planners',
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: 'camera',
    color: '#F2A10C',
    tint: '#FFF4DB',
    description: 'Photographers, videographers & editors',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'megaphone',
    color: '#DB2777',
    tint: '#FCE7F3',
    description: 'Digital marketers, content & brand strategists',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'apps',
    color: '#686C80',
    tint: '#F1F1F7',
    description: 'Every other kind of professional',
  },
];

export const getCategory = (id: CategoryId): Category =>
  categories.find((c) => c.id === id) ?? categories[categories.length - 1];

// Quick search suggestions shown on Home and Search
export const popularSearches = [
  'Web Developer',
  'Architect',
  'UI/UX Designer',
  'Doctor',
  'Photographer',
  'React',
  'Business Consultant',
];
