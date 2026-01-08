import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Eye, Plus, Search, AlertCircle, X, Loader2 } from 'lucide-react';
import { newsApi, News, ApiError } from '../../services/api';

const NewsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.list({ pageSize: 50 });
      setNews(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar notícias');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (id: string) => {
    setConfirmModal(null);
    navigate(`/admin/news/${id}`);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-amber-50 text-amber-600 border-amber-200',
      published: 'bg-green-50 text-green-600 border-green-200',
      archived: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
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
        <button onClick={loadNews} className="text-sm text-red-600 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Procurar notícia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-corporate-primary transition-all"
          />
        </div>
        <Link
          to="/admin/news/new"
          className="w-full md:w-auto bg-corporate-primary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-500 transition-all shadow-lg shadow-corporate-primary/20"
        >
          <Plus size={18} /> Nova Notícia
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Título da Notícia</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5">Data Publicação</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {item.coverUrl ? (
                          <img src={item.coverUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">{item.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">/{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-slate-600 font-medium">{formatDate(item.publishedAt)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/news/${item.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-corporate-primary bg-slate-50 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-100">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setConfirmModal(item.id)}
                        className="p-2 text-slate-400 hover:text-sky-600 bg-slate-50 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-100"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNews.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                    Nenhuma notícia encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-corporate-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Editar Artigo</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Está prestes a avançar para a edição do artigo. Deseja continuar e carregar o editor completo?
              </p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-grow py-3 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEdit(confirmModal)}
                className="flex-grow py-3 px-4 bg-corporate-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sky-500 transition-all shadow-lg shadow-corporate-primary/20"
              >
                Continuar
              </button>
            </div>
            <button
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;