import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Edit2, Eye, Plus, LayoutDashboard, Loader2, Database, Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { newsApi, analyticsApi, News, AnalyticsOverview, ApiError } from '../../services/api';
import { performBackup, formatBackupTime, getLastBackupTime } from '../../services/newsBackup';

const Dashboard: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>(formatBackupTime());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsRes, overviewRes] = await Promise.all([
        newsApi.list({ pageSize: 5 }),
        analyticsApi.overview('30d'),
      ]);
      setNews(newsRes.data);
      setOverview(overviewRes);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Build metrics from real data
  const metrics = [
    {
      label: 'Visualizações',
      value: overview?.totals?.views?.toLocaleString() || '0',
      change: '-',
      isPositive: true,
      icon: Eye
    },
    {
      label: 'Cliques',
      value: overview?.totals?.clicks?.toLocaleString() || '0',
      change: '-',
      isPositive: true,
      icon: Edit2
    },
    {
      label: 'Partilhas',
      value: overview?.totals?.shares?.toLocaleString() || '0',
      change: '-',
      isPositive: true,
      icon: ArrowUpRight
    },
    {
      label: 'Total Notícias',
      value: news.length.toString(),
      change: '-',
      isPositive: true,
      icon: LayoutDashboard
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadData} className="text-sm text-red-600 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Grid */}
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link to="/admin/analytics?type=visits" className="block">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-corporate-primary group-hover:text-white transition-colors">
                <Eye size={20} className="text-corporate-primary group-hover:text-white" />
              </div>
              {/* Change indicator removed for simplicity/cleanliness as requested by "modern look" */}
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Visualizações</p>
            <p className="text-2xl font-bold text-slate-900 truncate">{overview?.totals?.views?.toLocaleString() || '0'}</p>
          </div>
        </Link>

        <Link to="/admin/interaction-metrics" className="block">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-corporate-primary group-hover:text-white transition-colors">
                <Edit2 size={20} className="text-corporate-primary group-hover:text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Interações</p>
            <p className="text-2xl font-bold text-slate-900 truncate">{overview?.totals?.clicks?.toLocaleString() || '0'}</p>
          </div>
        </Link>

        <Link to="/admin/news-metrics?type=shared" className="block">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-corporate-primary group-hover:text-white transition-colors">
                <ArrowUpRight size={20} className="text-corporate-primary group-hover:text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Partilhas</p>
            <p className="text-2xl font-bold text-slate-900 truncate">{overview?.totals?.shares?.toLocaleString() || '0'}</p>
          </div>
        </Link>

        <Link to="/admin/news" className="block">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-corporate-primary group-hover:text-white transition-colors">
                <LayoutDashboard size={20} className="text-corporate-primary group-hover:text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Notícias</p>
            <p className="text-2xl font-bold text-slate-900 truncate">{news.length.toString()}</p>
          </div>
        </Link>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Gestão de Notícias</h2>
            <Link to="/admin/news/new" className="text-corporate-primary p-1 hover:bg-slate-50 rounded transition-colors">
              <Plus size={20} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Título</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {news.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{formatDate(item.publishedAt || item.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/news/${item.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-corporate-primary">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/news/${item.id}`} className="p-2 text-slate-400 hover:text-corporate-primary">
                          <Edit2 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {news.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                      Nenhuma notícia encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
            <Link to="/admin/news" className="text-xs font-bold text-corporate-primary uppercase tracking-widest hover:underline">Ver Todas</Link>
          </div>
        </div>

        {/* Quick Tips / System Status */}
        <div className="space-y-6">
          <div className="bg-corporate-primary text-white p-8 rounded-2xl shadow-xl shadow-corporate-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <LayoutDashboard size={80} />
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Bem-vindo, Admin</h3>
            <p className="text-sky-100 text-sm leading-relaxed mb-6 relative z-10">
              Dados carregados em tempo real da base de dados. Período: últimos 30 dias.
            </p>
            <Link to="/admin/analytics?type=visits" className="bg-white text-corporate-primary px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-sky-50 transition-colors relative z-10 inline-block">
              Ver Relatórios
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-6">Estado do Sistema</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Analytics API</span>
                <span className="text-green-500 font-bold">{overview ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Base de Dados</span>
                <span className="text-green-500 font-bold">{news.length >= 0 ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Período Analytics</span>
                <span className="text-slate-700 font-bold">{overview?.period || 30} dias</span>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock size={14} />
                    Último Backup
                  </span>
                  <span className="text-slate-700 font-medium text-xs">{lastBackup}</span>
                </div>
                <button
                  onClick={async () => {
                    setBackupLoading(true);
                    await performBackup();
                    setLastBackup(formatBackupTime());
                    setBackupLoading(false);
                  }}
                  disabled={backupLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-corporate-primary hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={backupLoading ? 'animate-spin' : ''} />
                  {backupLoading ? 'A fazer backup...' : 'Backup Manual'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;