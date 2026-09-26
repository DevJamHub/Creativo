// Core domain types for Creativo.
// Every user owns a "Professional Repository": the structured answer to
// "who am I, what can I do, what have I done, and how can people reach me".

import type Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = keyof typeof Ionicons.glyphMap;

export type CategoryId =
  | 'it'
  | 'architecture'
  | 'healthcare'
  | 'business'
  | 'design'
  | 'engineering'
  | 'education'
  | 'legal'
  | 'finance'
  | 'photography'
  | 'marketing'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: IconName;
  color: string; // strong brand color for the category
  tint: string; // soft background color for the category
  description: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Service {
  id: string;
  title: string;
  description: string;
}

export interface Experience {
  id: string;
  position: string;
  organization: string;
  startDate: string;
  endDate: string | null; // null = present
  location?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  tools: string[];
  year: string;
  link?: string;
  images: string[];
}

export type PortfolioType = 'image' | 'link' | 'document';

export interface PortfolioItem {
  id: string;
  title: string;
  type: PortfolioType;
  url: string;
  description?: string;
  thumbnail?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  role: string;
  duration: string;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description?: string;
}

export type LinkType = 'github' | 'linkedin' | 'website' | 'behance' | 'dribbble' | 'instagram' | 'other';

export interface ProfessionalLink {
  id: string;
  type: LinkType;
  label: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  whatsapp?: string;
  phone?: string;
  other?: string;
}

// A professional and their full repository.
export interface Professional {
  id: string;
  name: string;
  handle: string; // used as the repository name, e.g. andi.pratama/repository
  avatar: string;
  profession: string;
  categoryId: CategoryId;
  headline: string; // short description shown on cards
  about: string;
  location: string;
  yearsOfExperience: number;
  availability: string;
  verified?: boolean;
  specializations: string[];
  skills: Skill[];
  services: Service[];
  experience: Experience[];
  projects: Project[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  organizations: Organization[];
  achievements: Achievement[];
  links: ProfessionalLink[];
  contact: ContactInfo;
  connections: string[]; // ids of this professional's own network (used for mutuals)
}

// Relationship between the current user and another professional.
export type ConnectionStatus = 'connected' | 'outgoing' | 'incoming' | 'none';

export type RepositorySectionKey =
  | 'profile'
  | 'skills'
  | 'services'
  | 'experience'
  | 'projects'
  | 'portfolio'
  | 'certificates'
  | 'organizations'
  | 'achievements'
  | 'links'
  | 'contact';

// Sections that hold a list of items the owner can add/remove.
export type ListSectionKey = Exclude<RepositorySectionKey, 'profile' | 'contact'>;
