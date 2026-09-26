// The Professional Repository structure.
//
// Professional Repository
// ├── Profile
// ├── Skills
// ├── Services
// ├── Experience
// ├── Projects
// ├── Portfolio
// ├── Certificates
// ├── Organizations
// ├── Achievements
// ├── Professional Links
// └── Contact

import type { IconName, Professional, RepositorySectionKey } from '@/types';

export interface RepositorySectionConfig {
  key: RepositorySectionKey;
  title: string;
  icon: IconName;
  caption: string; // what this section answers about the professional
  count: (p: Professional) => number;
}

export const repositorySections: RepositorySectionConfig[] = [
  { key: 'profile', title: 'Profile', icon: 'person-circle-outline', caption: 'Who I am', count: () => 1 },
  { key: 'skills', title: 'Skills', icon: 'flash-outline', caption: 'What I can do', count: (p) => p.skills.length },
  { key: 'services', title: 'Services', icon: 'hand-left-outline', caption: 'How I can help you', count: (p) => p.services.length },
  { key: 'experience', title: 'Experience', icon: 'briefcase-outline', caption: 'Where I have worked', count: (p) => p.experience.length },
  { key: 'projects', title: 'Projects', icon: 'layers-outline', caption: 'What I have built', count: (p) => p.projects.length },
  { key: 'portfolio', title: 'Portfolio', icon: 'images-outline', caption: 'Work samples & documents', count: (p) => p.portfolio.length },
  { key: 'certificates', title: 'Certificates', icon: 'ribbon-outline', caption: 'Verified credentials', count: (p) => p.certificates.length },
  { key: 'organizations', title: 'Organizations', icon: 'people-outline', caption: 'Communities I belong to', count: (p) => p.organizations.length },
  { key: 'achievements', title: 'Achievements', icon: 'trophy-outline', caption: 'Awards & recognition', count: (p) => p.achievements.length },
  { key: 'links', title: 'Professional Links', icon: 'link-outline', caption: 'Find me elsewhere', count: (p) => p.links.length },
  { key: 'contact', title: 'Contact', icon: 'chatbubble-ellipses-outline', caption: 'How to reach me', count: (p) => Object.values(p.contact).filter(Boolean).length },
];

export const getSectionConfig = (key: RepositorySectionKey) =>
  repositorySections.find((s) => s.key === key) ?? repositorySections[0];

export const isSectionKey = (value: unknown): value is RepositorySectionKey =>
  typeof value === 'string' && repositorySections.some((s) => s.key === value);

// Repository strength: share of sections that have at least one item
export function repositoryStrength(p: Professional): number {
  const filled = repositorySections.filter((s) => s.count(p) > 0).length;
  return Math.round((filled / repositorySections.length) * 100);
}
