
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MousePointer2, Layout, Navigation, BarChart2, Loader2, List, Map } from 'lucide-react';
import { analyticsApi, RankingItem, AnalyticsOverview, ApiError } from '../../services/api';

const InteractionMetrics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [overviewRes, rankingRes] = await Promise.all([
                analyticsApi.overview('30d'),
                analyticsApi.ranking({ metric: 'clicks', period: '30d', limit: 50 })
            ]);
            setOverview(overviewRes);
            setRanking(rankingRes.data);
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

    // Helper to aggregate counts for visual map zones
    const getZoneCount = (prefix: string) => {
        return ranking
            .filter(item => item.title?.startsWith(prefix))
            .reduce((acc, curr) => acc + curr.total, 0);
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

    const heroCount = getZoneCount('hero_');
    const navCount = getZoneCount('nav_');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & KPI */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <MousePointer2 className="text-corporate-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Métricas de Interação</h2>
                        <p className="text-slate-500 text-sm">Análise de cliques e zonas quentes</p>
                    </div>
                </div>

                <div className="bg-white px-8 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Interações</p>
                        <span className="text-lg text-slate-500 text-[10px]">(30 dias)</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{(overview?.totals.clicks || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-center mb-4">
                <div className="bg-slate-100 p-1 rounded-lg flex pb-0 pt-0">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List size={16} /> Lista
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Map size={16} /> Mapa de Zonas
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Ranking de Elementos Mais Clicados</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {ranking.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">Sem dados de interação</div>
                        ) : (
                            ranking.map((item, idx) => (
                                <div key={idx} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-xs font-bold">{idx + 1}</span>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{item.title}</p>
                                            <span className="text-[10px] text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                {item.title?.startsWith('nav_') ? 'Navigation' : item.title?.startsWith('hero_') ? 'Hero Section' : 'Other'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-corporate-primary">{item.total.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase font-normal ml-1">cliques</span></span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'map' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Navbar Zone */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Navigation size={100} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Navigation size={24} />
                            </div>
                            <span className="text-2xl font-bold text-indigo-600">{navCount}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Zona de Navegação (Navbar)</h3>
                        <p className="text-sm text-slate-500 mb-6">Interações com o menu principal e logótipo.</p>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Principais Áreas</h4>
                            {ranking.filter(r => r.title?.startsWith('nav_')).slice(0, 3).map((r, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-slate-600 font-medium">{r.title?.replace('nav_', '')}</span>
                                    <span className="font-bold text-slate-800">{r.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Zone */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Layout size={100} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                                <Layout size={24} />
                            </div>
                            <span className="text-2xl font-bold text-sky-600">{heroCount}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Zona de Destaque (Hero)</h3>
                        <p className="text-sm text-slate-500 mb-6">Interações na primeira dobra da página (Botões CTA).</p>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Principais Áreas</h4>
                            {ranking.filter(r => r.title?.startsWith('hero_')).slice(0, 3).map((r, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-slate-600 font-medium">{r.title?.replace('hero_', '')}</span>
                                    <span className="font-bold text-slate-800">{r.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractionMetrics;
