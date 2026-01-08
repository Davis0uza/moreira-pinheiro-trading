import { LayoutDashboard, Users, Clock, MousePointer2, Share2, Eye } from 'lucide-react';
import { AdminMetric, AnalyticsData } from '../types';

export const dashboardMetrics: AdminMetric[] = [
  { label: 'Visitas Totais', value: '12,450', change: '+12%', isPositive: true, icon: Users },
  { label: 'Tempo Médio', value: '4m 32s', change: '+5%', isPositive: true, icon: Clock },
  { label: 'Cliques Globais', value: '8,902', change: '-2%', isPositive: false, icon: MousePointer2 },
  { label: 'Notícia mais Vista', value: 'Expansão Ásia', change: 'Top 1', isPositive: true, icon: Eye },
  { label: 'Taxa de Partilha', value: '18.5%', change: '+3%', isPositive: true, icon: Share2 },
];

export const getAnalyticsData = (type: string, period: string): AnalyticsData[] => {
  const points = period === '7d' ? 7 : period === '30d' ? 12 : 12;
  const baseValue = type === 'visits' ? 500 : 200;
  
  return Array.from({ length: points }).map((_, i) => ({
    date: period === '1y' ? `Mês ${i + 1}` : `Dia ${i + 1}`,
    value: Math.floor(Math.random() * baseValue) + baseValue / 2
  }));
};

export const newsPerformanceMetrics = {
  totalClicks: 4567,
  mostLoaded: { id: 1, title: "Expansão Logística para o Mercado Asiático", value: 1200 },
  mostShared: { id: 2, title: "Novas Parcerias no Setor Farmacêutico", value: 450 }
};