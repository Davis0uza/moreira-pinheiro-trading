import { LucideIcon } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  imageUrl: string;
  content?: string;
  // Campos estendidos para o editor completo
  intro?: string;
  body1?: string;
  subtitle2?: string;
  intro2?: string;
  image2?: string;
  caption2?: string;
  body2?: string;
  // Métricas
  views?: number;
  shares?: number;
}

export interface ValueItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface SectorItem {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export interface AdminMetric {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
}

export interface AnalyticsData {
  date: string;
  value: number;
}