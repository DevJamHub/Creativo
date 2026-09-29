// Profession model: the professions a user can pick (onboarding, Edit profil).
// Each one sets the user's workspace name, tagline, focus areas, headline hint,
// and what kind of work they post to the feed.

import type { IconName } from '@/models/icon';
import { colors } from '@/theme';

/** How many specializations a user can pick, and how long a headline can be (matches the DB check) */
export const MAX_FOCUS = 5;
export const HEADLINE_MAX = 120;

export type ExperienceLevel = 'student' | 'junior' | 'mid' | 'senior' | 'lead';

export const experienceLevels: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: 'student', label: 'Mahasiswa/Pelajar', hint: 'Masih belajar' },
  { id: 'junior', label: 'Junior', hint: '0–2 tahun' },
  { id: 'mid', label: 'Menengah', hint: '2–5 tahun' },
  { id: 'senior', label: 'Senior', hint: '5+ tahun' },
  { id: 'lead', label: 'Lead', hint: 'Memimpin tim' },
];

export interface Profession {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  tint: string;
  /** Name of the user's workspace, e.g. "Ruang Kerja Dev" */
  workspace: string;
  tagline: string;
  /** Specializations offered in onboarding */
  focus: string[];
  headlinePlaceholder: string;
  /** What this profession posts to the feed */
  showcase: { noun: string; icon: IconName };
}

export const professions: Profession[] = [
  {
    id: 'informatics',
    label: 'Engineer Informatika',
    icon: 'code-slash',
    color: colors.primary,
    tint: colors.primarySoft,
    workspace: 'Ruang Kerja Dev',
    tagline: 'Rilis aplikasi, pamerkan hasil buatanmu, dan perluas relasi developer-mu.',
    focus: [
      'Aplikasi Mobile',
      'Pengembangan Web',
      'Backend & APIs',
      'UI Engineering',
      'AI / Machine Learning',
      'Rekayasa Data',
      'DevOps & Cloud',
      'Keamanan Siber',
      'Pengembangan Game',
      'IoT & Embedded',
    ],
    headlinePlaceholder: 'Mobile developer yang membangun aplikasi dengan React Native',
    showcase: { noun: 'screenshot aplikasi', icon: 'phone-portrait-outline' },
  },
  {
    id: 'uiux',
    label: 'Desainer UI/UX',
    icon: 'color-palette',
    color: colors.violet,
    tint: colors.violetSoft,
    workspace: 'Studio Desain',
    tagline: 'Bagikan shot, studi kasus, dan proses desainmu.',
    focus: ['Mobile UI', 'Web UI', 'Riset UX', 'Design System', 'Prototyping', 'Desain Motion', 'Desain Produk'],
    headlinePlaceholder: 'Product designer yang merancang pengalaman mobile yang simpel',
    showcase: { noun: 'shot desain', icon: 'albums-outline' },
  },
  {
    id: 'graphic',
    label: 'Desainer Grafis',
    icon: 'brush',
    color: colors.pink,
    tint: colors.pinkSoft,
    workspace: 'Papan Kreatif',
    tagline: 'Tampilkan karya branding, ilustrasi, dan layout kamu.',
    focus: ['Branding', 'Ilustrasi', 'Tipografi', 'Kemasan', 'Cetak & Editorial', 'Desain Media Sosial'],
    headlinePlaceholder: 'Desainer brand yang suka tipografi tegas',
    showcase: { noun: 'karya', icon: 'color-palette-outline' },
  },
  {
    id: 'architect',
    label: 'Arsitek',
    icon: 'business',
    color: colors.amber,
    tint: colors.amberSoft,
    workspace: 'Studio Arsitektur',
    tagline: 'Tampilkan render, denah, dan bangunan hasil karyamu.',
    focus: ['Hunian', 'Komersial', 'Interior', 'Perencanaan Kota', 'Lanskap', 'Desain Berkelanjutan', 'Visualisasi 3D'],
    headlinePlaceholder: 'Arsitek yang merancang rumah hangat dan berkelanjutan',
    showcase: { noun: 'render & denah', icon: 'cube-outline' },
  },
  {
    id: 'photographer',
    label: 'Fotografer',
    icon: 'camera',
    color: colors.sky,
    tint: colors.skySoft,
    workspace: 'Studio Foto',
    tagline: 'Kurasi foto terbaik dan seri fotomu.',
    focus: ['Potret', 'Pernikahan', 'Produk', 'Jalanan', 'Lanskap', 'Fashion', 'Acara'],
    headlinePlaceholder: 'Fotografer potret yang berbasis di Jakarta',
    showcase: { noun: 'foto', icon: 'camera-outline' },
  },
  {
    id: 'creator',
    label: 'Kreator Video & Konten',
    icon: 'videocam',
    color: colors.accent,
    tint: colors.accentSoft,
    workspace: 'Pusat Kreator',
    tagline: 'Pamerkan video, reels, dan channel kamu.',
    focus: ['Video Editing', 'Motion Graphics', 'YouTube', 'Video Pendek', 'Podcast', 'Cinematography'],
    headlinePlaceholder: 'Video editor yang bercerita dalam 60 detik',
    showcase: { noun: 'thumbnail video', icon: 'film-outline' },
  },
  {
    id: 'data',
    label: 'Data Scientist',
    icon: 'analytics',
    color: colors.mint,
    tint: colors.mintSoft,
    workspace: 'Lab Data',
    tagline: 'Bagikan dasbor, model, dan notebook.',
    focus: ['Machine Learning', 'Analisis Data', 'Visualisasi Data', 'NLP', 'Computer Vision', 'Statistika', 'Big Data'],
    headlinePlaceholder: 'Data scientist yang mengubah data berantakan menjadi keputusan',
    showcase: { noun: 'dasbor & grafik', icon: 'bar-chart-outline' },
  },
  {
    id: 'marketer',
    label: 'Digital Marketer',
    icon: 'megaphone',
    color: colors.amber,
    tint: colors.amberSoft,
    workspace: 'Ruang Kampanye',
    tagline: 'Tampilkan kampanye, hasil, dan brand yang kamu kembangkan.',
    focus: ['Media Sosial', 'SEO', 'Iklan Performa', 'Pemasaran Konten', 'Copywriting', 'Pemasaran Email'],
    headlinePlaceholder: 'Growth marketer untuk startup tahap awal',
    showcase: { noun: 'visual kampanye', icon: 'megaphone-outline' },
  },
  {
    id: 'other',
    label: 'Profesional Lainnya',
    icon: 'briefcase',
    color: colors.textMuted,
    tint: colors.surfaceAlt,
    workspace: 'Ruang Kerjaku',
    tagline: 'Tampilkan karyamu dan terhubung dengan orang-orang di bidangmu.',
    focus: ['Freelance', 'Konsultan', 'Pendidikan', 'Bisnis', 'Kesehatan', 'Teknik', 'Penulisan'],
    headlinePlaceholder: 'Apa pekerjaanmu, dalam satu kalimat',
    showcase: { noun: 'karya', icon: 'briefcase-outline' },
  },
];

const fallback = professions[professions.length - 1];

export function getProfession(id: string | null | undefined): Profession {
  return professions.find((p) => p.id === id) ?? fallback;
}

export function experienceLabel(level: string | null | undefined): string | null {
  return experienceLevels.find((l) => l.id === level)?.label ?? null;
}
