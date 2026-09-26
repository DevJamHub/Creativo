// Form definitions for adding items to "My Repository".
// Each section declares its fields and how to turn the form values into a typed item.

import type { LinkType, ListSectionKey, PortfolioType, Professional, SkillLevel } from '@/types';

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  options?: string[]; // renders as selectable chips instead of a text input
  keyboardType?: 'default' | 'url' | 'email-address' | 'phone-pad';
  hint?: string;
}

export interface SectionForm<K extends ListSectionKey = ListSectionKey> {
  title: string;
  fields: FieldDef[];
  build: (v: Record<string, string>, id: string) => Professional[K][number];
}

const splitTags = (value: string) =>
  value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

export const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const linkTypes: LinkType[] = ['github', 'linkedin', 'website', 'behance', 'dribbble', 'instagram', 'other'];
const portfolioTypes: PortfolioType[] = ['link', 'image', 'document'];

export const sectionForms: { [K in ListSectionKey]: SectionForm<K> } = {
  skills: {
    title: 'Add skill',
    fields: [
      { key: 'name', label: 'Skill', placeholder: 'e.g. React, AutoCAD, Figma', required: true },
      { key: 'level', label: 'Level', options: skillLevels, required: true },
    ],
    build: (v, id) => ({ id, name: v.name, level: (v.level as SkillLevel) || 'Intermediate' }),
  },
  services: {
    title: 'Add service',
    fields: [
      { key: 'title', label: 'Service', placeholder: 'e.g. Mobile App Development', required: true },
      { key: 'description', label: 'Description', placeholder: 'What does the client get?', multiline: true },
    ],
    build: (v, id) => ({ id, title: v.title, description: v.description ?? '' }),
  },
  experience: {
    title: 'Add experience',
    fields: [
      { key: 'position', label: 'Position', placeholder: 'e.g. Software Engineer', required: true },
      { key: 'organization', label: 'Organization', placeholder: 'Company or institution', required: true },
      { key: 'startDate', label: 'Start date', placeholder: 'e.g. Jan 2024', required: true },
      { key: 'endDate', label: 'End date', placeholder: 'Leave empty if current' },
      { key: 'location', label: 'Location', placeholder: 'e.g. Jakarta / Remote' },
      { key: 'description', label: 'Description', multiline: true },
    ],
    build: (v, id) => ({
      id,
      position: v.position,
      organization: v.organization,
      startDate: v.startDate,
      endDate: v.endDate || null,
      location: v.location || undefined,
      description: v.description || undefined,
    }),
  },
  projects: {
    title: 'Add project',
    fields: [
      { key: 'name', label: 'Project name', required: true },
      { key: 'description', label: 'Description', multiline: true, required: true },
      { key: 'role', label: 'Your role', placeholder: 'e.g. Lead Developer', required: true },
      { key: 'tools', label: 'Technologies / tools', placeholder: 'Comma separated, e.g. React, Figma', hint: 'Separate with commas' },
      { key: 'year', label: 'Year', placeholder: '2026' },
      { key: 'link', label: 'Project link', placeholder: 'https://', keyboardType: 'url' },
      { key: 'image', label: 'Image URL', placeholder: 'https:// (optional)', keyboardType: 'url' },
    ],
    build: (v, id) => ({
      id,
      name: v.name,
      description: v.description,
      role: v.role,
      tools: splitTags(v.tools ?? ''),
      year: v.year || String(new Date().getFullYear()),
      link: v.link || undefined,
      images: v.image ? [v.image] : [`https://picsum.photos/seed/${id}/800/520`],
    }),
  },
  portfolio: {
    title: 'Add portfolio item',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'type', label: 'Type', options: portfolioTypes, required: true },
      { key: 'url', label: 'URL', placeholder: 'https://', keyboardType: 'url', required: true },
      { key: 'description', label: 'Description' },
    ],
    build: (v, id) => {
      const type = (v.type as PortfolioType) || 'link';
      return { id, title: v.title, type, url: v.url, description: v.description || undefined, thumbnail: type === 'image' ? v.url : undefined };
    },
  },
  certificates: {
    title: 'Add certificate',
    fields: [
      { key: 'name', label: 'Certificate name', required: true },
      { key: 'issuer', label: 'Issuer', required: true },
      { key: 'date', label: 'Date', placeholder: 'e.g. Aug 2025', required: true },
      { key: 'credentialUrl', label: 'Credential link', placeholder: 'https://', keyboardType: 'url' },
    ],
    build: (v, id) => ({ id, name: v.name, issuer: v.issuer, date: v.date, credentialUrl: v.credentialUrl || undefined }),
  },
  organizations: {
    title: 'Add organization',
    fields: [
      { key: 'name', label: 'Organization', required: true },
      { key: 'role', label: 'Role', placeholder: 'e.g. Member, Organizer', required: true },
      { key: 'duration', label: 'Duration', placeholder: 'e.g. 2023 – Present', required: true },
    ],
    build: (v, id) => ({ id, name: v.name, role: v.role, duration: v.duration }),
  },
  achievements: {
    title: 'Add achievement',
    fields: [
      { key: 'title', label: 'Achievement', required: true },
      { key: 'issuer', label: 'Issued by', required: true },
      { key: 'year', label: 'Year', placeholder: '2026', required: true },
      { key: 'description', label: 'Description', multiline: true },
    ],
    build: (v, id) => ({ id, title: v.title, issuer: v.issuer, year: v.year, description: v.description || undefined }),
  },
  links: {
    title: 'Add professional link',
    fields: [
      { key: 'type', label: 'Platform', options: linkTypes, required: true },
      { key: 'label', label: 'Label', placeholder: 'e.g. GitHub, my portfolio', required: true },
      { key: 'url', label: 'URL', placeholder: 'https://', keyboardType: 'url', required: true },
    ],
    build: (v, id) => ({ id, type: (v.type as LinkType) || 'other', label: v.label, url: v.url }),
  },
};

export const isListSection = (value: unknown): value is ListSectionKey =>
  typeof value === 'string' && value in sectionForms;
