import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { analyticsApi, TimeseriesPoint, ApiError } from '../../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'visits';
  const period = (searchParams.get('period') || '30d') as '7d' | '30d' | '1y';

  const [data, setData] = useState<TimeseriesPoint[]>([]);
  const [changePercentage, setChangePercentage] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map UI type to API metric
  const metric = type === 'visits' ? 'views' : type === 'clicks' ? 'clicks' : 'views';

  useEffect(() => {
    loadData();
  }, [type, period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsApi.timeseries({ period, metric: metric as 'views' | 'clicks' | 'shares' });
      setData(response.data);

      // Fallback calculation if backend doesn't return it yet (or cache issues)
      let pct = response.changePercentage;
      if (pct === undefined && response.data && response.data.length > 0) {
        const sorted = [...response.data].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const first = Number(sorted[0].value) || 0;
        const last = Number(sorted[sorted.length - 1].value) || 0;

        if (first > 0) pct = ((last - first) / first) * 100;
        else if (last > 0) pct = 100;
        else pct = 0;
      }

      setChangePercentage(pct !== undefined ? Number(pct.toFixed(1)) : undefined);
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

  const total = useMemo(() => data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0), [data]);

  const chartData = useMemo(() => data.map(d => ({
    name: period === '1y'
      ? new Date(d.date).toLocaleDateString('pt-PT', { month: 'short' })
      : new Date(d.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
    fullDate: new Date(d.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
    value: Number(d.value)
  })), [data, period]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-white font-bold text-lg">
            {payload[0].value.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-2">{type === 'visits' ? 'visualizações' : 'interações'}</span>
          </p>
        </div>
      );
    }
    return null;
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setSearchParams({ type: 'visits', period })}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${type === 'visits' ? 'bg-white shadow-sm text-corporate-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visualizações
          </button>
          <button
            onClick={() => setSearchParams({ type: 'clicks', period })}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${type === 'clicks' ? 'bg-white shadow-sm text-corporate-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Interações
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setSearchParams({ type, period: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-corporate-primary focus:ring-1 focus:ring-corporate-primary transition-all appearance-none cursor-pointer shadow-sm min-w-[180px]"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="1y">Último Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Access Actions based on tab */}
      {type === 'visits' && (
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-corporate-primary/10 flex items-center justify-center">
              <TrendingUp className="text-corporate-primary" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Análise Detalhada de Notícias</h4>
              <p className="text-xs text-slate-500">Ranking das notícias mais lidas e partilhadas</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/admin/news-metrics'} className="bg-white text-corporate-primary hover:bg-corporate-primary hover:text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-corporate-primary/20 shadow-sm transition-all">
            Ver Métricas
          </button>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.2em] mb-1">Evolução Temporal</h3>
              <p className="text-slate-400 text-xs font-medium">Fluxo de {type === 'visits' ? 'visualizações' : 'interações'}</p>
            </div>
            {changePercentage !== undefined && (
              <div className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${changePercentage >= 0
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : 'text-yellow-600 bg-yellow-50 border-yellow-100'
                }`}>
                {changePercentage >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>
                  {changePercentage > 0 ? '+' : ''}{changePercentage}%
                  <span className="hidden md:inline ml-1 font-medium opacity-70">vs início do período</span>
                </span>
              </div>
            )}
          </div>

          <div className="h-[350px] w-full mt-4">
            {chartData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">Sem dados para este período</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="natural"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={2000}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#0ea5e9', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col justify-center text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total no Período</p>
            <h2 className="text-5xl font-bold text-slate-900 mb-2">{total.toLocaleString()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Eventos de {type}</p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4 text-white">
              <Calendar size={20} className="text-corporate-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Período</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '1 ano'}</p>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Dados agregados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;