// Professions a user can pick during onboarding.
// Each one tailors the dashboard: its workspace name, stats, quick actions and sections,
// and what kind of work the user posts to the feed.

import { colors } from '@/theme';
import type { IconName } from '@/types';

export type ExperienceLevel = 'student' | 'junior' | 'mid' | 'senior' | 'lead';

export const experienceLevels: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: 'student', label: 'Student', hint: 'Still learning' },
  { id: 'junior', label: 'Junior', hint: '0–2 years' },
  { id: 'mid', label: 'Mid-level', hint: '2–5 years' },
  { id: 'senior', label: 'Senior', hint: '5+ years' },
  { id: 'lead', label: 'Lead', hint: 'Leading a team' },
];

export interface DashboardSection {
  title: string;
  icon: IconName;
  emptyTitle: string;
  emptyText: string;
}

export interface Profession {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  tint: string;
  /** Name of the tailored dashboard, e.g. "Dev Workspace" */
  workspace: string;
  tagline: string;
  /** Specializations offered in onboarding */
  focus: string[];
  headlinePlaceholder: string;
  /** What this profession posts to the feed */
  showcase: { noun: string; icon: IconName };
  stats: { label: string; icon: IconName }[];
  actions: { label: string; icon: IconName; upload?: boolean }[];
  sections: DashboardSection[];
}

export const professions: Profession[] = [
  {
    id: 'informatics',
    label: 'Informatics Engineer',
    icon: 'code-slash',
    color: colors.primary,
    tint: colors.primarySoft,
    workspace: 'Dev Workspace',
    tagline: 'Ship apps, show your builds and grow your dev circle.',
    focus: [
      'Mobile Apps',
      'Web Development',
      'Backend & APIs',
      'UI Engineering',
      'AI / Machine Learning',
      'Data Engineering',
      'DevOps & Cloud',
      'Cyber Security',
      'Game Development',
      'IoT & Embedded',
    ],
    headlinePlaceholder: 'Mobile developer building apps with React Native',
    showcase: { noun: 'app screenshots', icon: 'phone-portrait-outline' },
    stats: [
      { label: 'Apps shipped', icon: 'rocket-outline' },
      { label: 'Projects', icon: 'git-branch-outline' },
      { label: 'Tech stack', icon: 'layers-outline' },
    ],
    actions: [
      { label: 'Upload app screenshots', icon: 'image-outline', upload: true },
      { label: 'New project', icon: 'git-branch-outline' },
      { label: 'Add tech stack', icon: 'code-slash-outline' },
      { label: 'Link GitHub', icon: 'logo-github' },
    ],
    sections: [
      {
        title: 'App showcase',
        icon: 'phone-portrait-outline',
        emptyTitle: 'No apps yet',
        emptyText: 'Upload screenshots of apps you have built. They will show up here and in the feed.',
      },
      {
        title: 'Projects',
        icon: 'git-branch-outline',
        emptyTitle: 'No projects yet',
        emptyText: 'Add the projects you have worked on and the stack you used.',
      },
      {
        title: 'Tech stack',
        icon: 'layers-outline',
        emptyTitle: 'Your stack is empty',
        emptyText: 'List the languages, frameworks and tools you work with.',
      },
    ],
  },
  {
    id: 'uiux',
    label: 'UI/UX Designer',
    icon: 'color-palette',
    color: colors.violet,
    tint: colors.violetSoft,
    workspace: 'Design Studio',
    tagline: 'Share your shots, case studies and design process.',
    focus: ['Mobile UI', 'Web UI', 'UX Research', 'Design Systems', 'Prototyping', 'Motion Design', 'Product Design'],
    headlinePlaceholder: 'Product designer crafting simple mobile experiences',
    showcase: { noun: 'design shots', icon: 'albums-outline' },
    stats: [
      { label: 'Shots', icon: 'albums-outline' },
      { label: 'Case studies', icon: 'reader-outline' },
      { label: 'Tools', icon: 'construct-outline' },
    ],
    actions: [
      { label: 'Upload a design shot', icon: 'image-outline', upload: true },
      { label: 'New case study', icon: 'reader-outline' },
      { label: 'Add tools', icon: 'construct-outline' },
      { label: 'Link Dribbble', icon: 'logo-dribbble' },
    ],
    sections: [
      {
        title: 'Shots',
        icon: 'albums-outline',
        emptyTitle: 'No shots yet',
        emptyText: 'Upload screens and visuals you have designed.',
      },
      {
        title: 'Case studies',
        icon: 'reader-outline',
        emptyTitle: 'No case studies yet',
        emptyText: 'Walk people through a problem, your process and the result.',
      },
    ],
  },
  {
    id: 'graphic',
    label: 'Graphic Designer',
    icon: 'brush',
    color: colors.pink,
    tint: colors.pinkSoft,
    workspace: 'Creative Board',
    tagline: 'Show your brand work, illustrations and layouts.',
    focus: ['Branding', 'Illustration', 'Typography', 'Packaging', 'Print & Editorial', 'Social Media Design'],
    headlinePlaceholder: 'Brand designer who loves bold typography',
    showcase: { noun: 'artwork', icon: 'color-palette-outline' },
    stats: [
      { label: 'Artworks', icon: 'color-palette-outline' },
      { label: 'Brands', icon: 'pricetags-outline' },
      { label: 'Tools', icon: 'construct-outline' },
    ],
    actions: [
      { label: 'Upload artwork', icon: 'image-outline', upload: true },
      { label: 'New brand project', icon: 'pricetags-outline' },
      { label: 'Add tools', icon: 'construct-outline' },
      { label: 'Link Behance', icon: 'link-outline' },
    ],
    sections: [
      {
        title: 'Artworks',
        icon: 'color-palette-outline',
        emptyTitle: 'No artwork yet',
        emptyText: 'Upload your illustrations, posters and layouts.',
      },
      {
        title: 'Brand projects',
        icon: 'pricetags-outline',
        emptyTitle: 'No brand projects yet',
        emptyText: 'Collect logos and identities you have created.',
      },
    ],
  },
  {
    id: 'architect',
    label: 'Architect',
    icon: 'business',
    color: colors.amber,
    tint: colors.amberSoft,
    workspace: 'Architecture Studio',
    tagline: 'Present your renders, plans and built work.',
    focus: ['Residential', 'Commercial', 'Interior', 'Urban Planning', 'Landscape', 'Sustainable Design', '3D Visualization'],
    headlinePlaceholder: 'Architect designing warm, sustainable homes',
    showcase: { noun: 'renders & plans', icon: 'cube-outline' },
    stats: [
      { label: 'Projects', icon: 'business-outline' },
      { label: 'Renders', icon: 'cube-outline' },
      { label: 'Software', icon: 'desktop-outline' },
    ],
    actions: [
      { label: 'Upload a render', icon: 'image-outline', upload: true },
      { label: 'New project', icon: 'business-outline' },
      { label: 'Add software', icon: 'desktop-outline' },
      { label: 'Add license', icon: 'ribbon-outline' },
    ],
    sections: [
      {
        title: 'Projects',
        icon: 'business-outline',
        emptyTitle: 'No projects yet',
        emptyText: 'Add buildings and spaces you have designed.',
      },
      {
        title: 'Renders & plans',
        icon: 'cube-outline',
        emptyTitle: 'Nothing uploaded yet',
        emptyText: 'Upload renders, floor plans and sketches.',
      },
    ],
  },
  {
    id: 'photographer',
    label: 'Photographer',
    icon: 'camera',
    color: colors.sky,
    tint: colors.skySoft,
    workspace: 'Photo Studio',
    tagline: 'Curate your best shots and photo series.',
    focus: ['Portrait', 'Wedding', 'Product', 'Street', 'Landscape', 'Fashion', 'Event'],
    headlinePlaceholder: 'Portrait photographer based in Jakarta',
    showcase: { noun: 'photos', icon: 'camera-outline' },
    stats: [
      { label: 'Photos', icon: 'camera-outline' },
      { label: 'Series', icon: 'images-outline' },
      { label: 'Gear', icon: 'aperture-outline' },
    ],
    actions: [
      { label: 'Upload photos', icon: 'image-outline', upload: true },
      { label: 'New series', icon: 'images-outline' },
      { label: 'Add gear', icon: 'aperture-outline' },
      { label: 'Link Instagram', icon: 'logo-instagram' },
    ],
    sections: [
      {
        title: 'Photos',
        icon: 'camera-outline',
        emptyTitle: 'No photos yet',
        emptyText: 'Upload the shots you are most proud of.',
      },
      {
        title: 'Series',
        icon: 'images-outline',
        emptyTitle: 'No series yet',
        emptyText: 'Group photos from one shoot or theme into a series.',
      },
    ],
  },
  {
    id: 'creator',
    label: 'Video & Content Creator',
    icon: 'videocam',
    color: colors.accent,
    tint: colors.accentSoft,
    workspace: 'Creator Hub',
    tagline: 'Showcase your videos, reels and channels.',
    focus: ['Video Editing', 'Motion Graphics', 'YouTube', 'Short-form Video', 'Podcast', 'Cinematography'],
    headlinePlaceholder: 'Video editor telling stories in 60 seconds',
    showcase: { noun: 'video thumbnails', icon: 'film-outline' },
    stats: [
      { label: 'Videos', icon: 'film-outline' },
      { label: 'Channels', icon: 'tv-outline' },
      { label: 'Tools', icon: 'construct-outline' },
    ],
    actions: [
      { label: 'Upload a thumbnail', icon: 'image-outline', upload: true },
      { label: 'Add a video', icon: 'film-outline' },
      { label: 'Add channel', icon: 'tv-outline' },
      { label: 'Link YouTube', icon: 'logo-youtube' },
    ],
    sections: [
      {
        title: 'Videos',
        icon: 'film-outline',
        emptyTitle: 'No videos yet',
        emptyText: 'Add videos and reels you have made.',
      },
      {
        title: 'Channels',
        icon: 'tv-outline',
        emptyTitle: 'No channels yet',
        emptyText: 'Link the channels where people can watch your work.',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data Scientist',
    icon: 'analytics',
    color: colors.mint,
    tint: colors.mintSoft,
    workspace: 'Data Lab',
    tagline: 'Share dashboards, models and notebooks.',
    focus: ['Machine Learning', 'Data Analysis', 'Data Visualization', 'NLP', 'Computer Vision', 'Statistics', 'Big Data'],
    headlinePlaceholder: 'Data scientist turning messy data into decisions',
    showcase: { noun: 'dashboards & charts', icon: 'bar-chart-outline' },
    stats: [
      { label: 'Models', icon: 'git-network-outline' },
      { label: 'Dashboards', icon: 'bar-chart-outline' },
      { label: 'Datasets', icon: 'server-outline' },
    ],
    actions: [
      { label: 'Upload a dashboard', icon: 'image-outline', upload: true },
      { label: 'New notebook', icon: 'document-text-outline' },
      { label: 'Add dataset', icon: 'server-outline' },
      { label: 'Link Kaggle', icon: 'link-outline' },
    ],
    sections: [
      {
        title: 'Dashboards',
        icon: 'bar-chart-outline',
        emptyTitle: 'No dashboards yet',
        emptyText: 'Upload charts and dashboards you have built.',
      },
      {
        title: 'Models & notebooks',
        icon: 'git-network-outline',
        emptyTitle: 'Nothing here yet',
        emptyText: 'Add models and notebooks with what they solve.',
      },
    ],
  },
  {
    id: 'marketer',
    label: 'Digital Marketer',
    icon: 'megaphone',
    color: colors.amber,
    tint: colors.amberSoft,
    workspace: 'Campaign Room',
    tagline: 'Show campaigns, results and the brands you grew.',
    focus: ['Social Media', 'SEO', 'Performance Ads', 'Content Marketing', 'Copywriting', 'Email Marketing'],
    headlinePlaceholder: 'Growth marketer for early-stage startups',
    showcase: { noun: 'campaign visuals', icon: 'megaphone-outline' },
    stats: [
      { label: 'Campaigns', icon: 'megaphone-outline' },
      { label: 'Brands', icon: 'pricetags-outline' },
      { label: 'Channels', icon: 'share-social-outline' },
    ],
    actions: [
      { label: 'Upload campaign visual', icon: 'image-outline', upload: true },
      { label: 'New campaign', icon: 'megaphone-outline' },
      { label: 'Add channels', icon: 'share-social-outline' },
      { label: 'Add results', icon: 'trending-up-outline' },
    ],
    sections: [
      {
        title: 'Campaigns',
        icon: 'megaphone-outline',
        emptyTitle: 'No campaigns yet',
        emptyText: 'Add campaigns with their goal and results.',
      },
      {
        title: 'Brands',
        icon: 'pricetags-outline',
        emptyTitle: 'No brands yet',
        emptyText: 'List the brands and clients you have worked with.',
      },
    ],
  },
  {
    id: 'other',
    label: 'Other Professional',
    icon: 'briefcase',
    color: colors.textMuted,
    tint: colors.surfaceAlt,
    workspace: 'My Workspace',
    tagline: 'Show your work and connect with people in your field.',
    focus: ['Freelance', 'Consulting', 'Education', 'Business', 'Healthcare', 'Engineering', 'Writing'],
    headlinePlaceholder: 'What you do, in one line',
    showcase: { noun: 'work', icon: 'briefcase-outline' },
    stats: [
      { label: 'Posts', icon: 'images-outline' },
      { label: 'Projects', icon: 'folder-outline' },
      { label: 'Skills', icon: 'sparkles-outline' },
    ],
    actions: [
      { label: 'Upload your work', icon: 'image-outline', upload: true },
      { label: 'New project', icon: 'folder-outline' },
      { label: 'Add skills', icon: 'sparkles-outline' },
      { label: 'Add a link', icon: 'link-outline' },
    ],
    sections: [
      {
        title: 'Work',
        icon: 'briefcase-outline',
        emptyTitle: 'Nothing here yet',
        emptyText: 'Upload examples of your work.',
      },
      {
        title: 'Projects',
        icon: 'folder-outline',
        emptyTitle: 'No projects yet',
        emptyText: 'Add projects you have worked on.',
      },
    ],
  },
];

const fallback = professions[professions.length - 1];

export function getProfession(id: string | null | undefined): Profession {
  return professions.find((p) => p.id === id) ?? fallback;
}

export function experienceLabel(level: string | null | undefined): string | null {
  return experienceLevels.find((l) => l.id === level)?.label ?? null;
}
