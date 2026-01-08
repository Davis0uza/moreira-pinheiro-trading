import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MousePointer2, Eye, Share2, ChevronRight, BarChart2, Loader2 } from 'lucide-react';
import { analyticsApi, RankingItem, AnalyticsOverview, ApiError } from '../../services/api';

const NewsMetrics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'loaded' (views) or 'shared' (shares)

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [topViews, setTopViews] = useState<RankingItem | null>(null);
  const [topShares, setTopShares] = useState<RankingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (type) {
        // Load ranking list
        const metric = type === 'loaded' ? 'views' : 'shares';
        const response = await analyticsApi.ranking({ metric: metric as 'views' | 'shares', period: '30d', limit: 20 });
        setRanking(response.data);
      } else {
        // Load overview and top items
        const [overviewRes, viewsRes, sharesRes] = await Promise.all([
          analyticsApi.overview('30d'),
          analyticsApi.ranking({ metric: 'views', period: '30d', limit: 1 }),
          analyticsApi.ranking({ metric: 'shares', period: '30d', limit: 1 }),
        ]);
        setOverview(overviewRes);
        setTopViews(viewsRes.data[0] || null);
        setTopShares(sharesRes.data[0] || null);
      }
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

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  // Ranking List View
  if (type) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/news-metrics" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <BarChart2 size={20} className="text-slate-400" />
          </Link>
          <h2 className="text-xl font-bold text-slate-800">
            {type === 'loaded' ? 'Ranking de Visualizações' : 'Ranking de Partilhas'}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Listagem de Artigos</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Métrica: {type === 'loaded' ? 'views' : 'shares'}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {ranking.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Sem dados disponíveis</div>
            ) : (
              ranking.map((item, idx) => (
                <div key={item.newsId} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-bold text-slate-200 w-8">{idx + 1}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-1">{item.title || 'Sem título'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{formatDate(item.publishedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-corporate-primary">{item.total.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total {type === 'loaded' ? 'views' : 'shares'}</p>
                    </div>
                    {item.slug && (
                      <Link to={`/news/${item.slug}`} target="_blank" className="p-2 text-slate-300 hover:text-corporate-primary transition-colors" title="Ver no site">
                        <Eye size={20} />
                      </Link>
                    )}
                    <Link to={`/admin/news/${item.newsId}`} className="p-2 text-slate-300 hover:text-corporate-primary transition-colors" title="Editar">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overview View
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Most Loaded Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-corporate-primary transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-sky-50 text-corporate-primary rounded-xl">
              <Eye size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Mais Visualizada</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Top Visibilidade</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-corporate-primary transition-colors">
                {topViews?.title || 'Sem dados'}
              </h4>
              {topViews?.slug && (
                <Link to={`/news/${topViews.slug}`} target="_blank" className="flex-shrink-0 p-1.5 bg-slate-50 rounded-lg hover:bg-corporate-primary hover:text-white transition-colors text-slate-400" title="Ver no site">
                  <Eye size={18} />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-900">{(topViews?.total || 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter pt-2">Vistas</span>
            </div>
          </div>

          <Link
            to="/admin/news-metrics?type=loaded"
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group-hover:bg-sky-50 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-corporate-primary">Ver Ranking Completo</span>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-corporate-primary" />
          </Link>
        </div>

        {/* Most Shared Card */}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl shadow-black/10 group hover:bg-slate-950 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Mais Partilhada</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Impacto Social</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-teal-500 transition-colors">
                {topShares?.title || 'Sem dados'}
              </h4>
              {topShares?.slug && (
                <Link to={`/news/${topShares.slug}`} target="_blank" className="flex-shrink-0 p-1.5 bg-slate-800 rounded-lg hover:bg-teal-500 hover:text-white transition-colors text-slate-500" title="Ver no site">
                  <Eye size={18} />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{(topShares?.total || 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter pt-2">Shares</span>
            </div>
          </div>

          <Link
            to="/admin/news-metrics?type=shared"
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl group-hover:bg-teal-500/10 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-teal-500">Ver Ranking Completo</span>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-teal-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsMetrics;