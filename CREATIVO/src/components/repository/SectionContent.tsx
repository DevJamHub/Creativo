// Renders any repository section by key. Used by the profile, the repository viewer
// and "My Repository" so every section looks the same everywhere.

import { CertificatesSection, OrganizationsSection, AchievementsSection } from './sections/CredentialSections';
import { ExperienceSection } from './sections/ExperienceSection';
import { ContactSection, LinksSection } from './sections/LinksContactSections';
import { PortfolioSection } from './sections/PortfolioSection';
import { ProfileSection } from './sections/ProfileSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ServicesSection } from './sections/ServicesSection';
import { SkillsSection } from './sections/SkillsSection';
import type { SectionProps } from './sections/shared';

import type { ReactNode } from 'react';

import type { RepositorySectionKey } from '@/types';

const renderers: Record<RepositorySectionKey, (props: SectionProps) => ReactNode> = {
  profile: ProfileSection,
  skills: SkillsSection,
  services: ServicesSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  portfolio: PortfolioSection,
  certificates: CertificatesSection,
  organizations: OrganizationsSection,
  achievements: AchievementsSection,
  links: LinksSection,
  contact: ContactSection,
};

export function SectionContent({ section, ...props }: SectionProps & { section: RepositorySectionKey }) {
  const Renderer = renderers[section];
  return <Renderer {...props} />;
}
