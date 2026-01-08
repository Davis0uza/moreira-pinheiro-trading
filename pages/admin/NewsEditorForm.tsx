import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, Eye, Layout, Type, Image as ImageIcon, Loader2 } from 'lucide-react';
import { newsApi, News, ContentJson, CreateNewsPayload, ApiError } from '../../services/api';
import ImageUpload from '../../components/admin/ImageUpload';

const NewsEditorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsItem, setNewsItem] = useState<News | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    intro: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    // contentJson fields
    coverUrl: '',
    body1: '',
    subtitle2: '',
    intro2: '',
    image2: '',
    caption2: '',
    body2: '',
  });

  // Load Data
  useEffect(() => {
    if (isEdit && id) {
      loadNews(id);
    }
  }, [id, isEdit]);

  const loadNews = async (newsId: string) => {
    setLoading(true);
    setError(null);
    try {
      const item = await newsApi.get(newsId);
      setNewsItem(item);

      // Hydrate form from item
      const content = (item.contentJson || {}) as ContentJson;
      setFormData({
        title: item.title || '',
        intro: item.intro || '',
        status: item.status || 'draft',
        coverUrl: content.coverUrl || item.coverUrl || '',
        body1: content.body1 || '',
        subtitle2: content.block2?.subtitle || '',
        intro2: content.block2?.intro || '',
        image2: content.block2?.imageUrl || '',
        caption2: content.block2?.caption || '',
        body2: content.block2?.body || '',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar notícia');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build contentJson
    const contentJson: ContentJson = {
      version: 1,
      coverUrl: formData.coverUrl || undefined,
      body1: formData.body1 || undefined,
    };

    // Add block2 if any field is filled
    if (formData.subtitle2 || formData.intro2 || formData.image2 || formData.caption2 || formData.body2) {
      contentJson.block2 = {
        subtitle: formData.subtitle2 || undefined,
        intro: formData.intro2 || undefined,
        imageUrl: formData.image2 || undefined,
        caption: formData.caption2 || undefined,
        body: formData.body2 || undefined,
      };
    }

    const payload: CreateNewsPayload = {
      title: formData.title,
      intro: formData.intro || undefined,
      status: formData.status,
      contentJson,
    };

    try {
      if (isEdit && id) {
        await newsApi.update(id, payload);
      } else {
        await newsApi.create(payload);
      }
      navigate('/admin/news');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao guardar notícia');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInput = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur py-6 border-b border-slate-200 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/news')} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">
              {isEdit ? 'Editar Notícia' : 'Nova Notícia'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Gestão de Conteúdo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 mr-4">
            <span className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-green-500' : formData.status === 'draft' ? 'bg-yellow-500' : 'bg-slate-400'}`}></span>
            <select
              value={formData.status}
              onChange={(e) => handleInput('status', e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none text-slate-600 cursor-pointer"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          {isEdit && newsItem && (
            <Link
              to={`/news/${newsItem.slug}`}
              target="_blank"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Eye size={16} /> <span className="hidden sm:inline">Ver Artigo</span>
            </Link>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-corporate-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-sky-500 transition-all shadow-lg shadow-corporate-primary/20 disabled:opacity-50 min-w-[140px] justify-center"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'A Guardar...' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm flex items-center gap-2">
          <span className="font-bold">Erro:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <Type size={18} className="text-corporate-primary" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Informações Principais</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título Principal *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInput('title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-corporate-primary transition-all placeholder:font-normal"
                placeholder="Escreva um título impactante..."
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo / Introdução</label>
              <textarea
                value={formData.intro}
                onChange={(e) => handleInput('intro', e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 outline-none focus:border-corporate-primary transition-all resize-none"
                placeholder="Breve sumário que aparece nos cards da homepage..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corpo da Notícia (Parágrafo 1)</label>
              <textarea
                value={formData.body1}
                onChange={(e) => handleInput('body1', e.target.value)}
                rows={12}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed outline-none focus:border-corporate-primary transition-all resize-y min-h-[200px]"
                placeholder="Escreva o conteúdo principal aqui..."
              />
            </div>
          </div>

          {/* Optional Block 2 */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layout size={18} className="text-slate-500" />
                <h3 className="font-bold text-slate-600 text-sm uppercase tracking-widest">Bloco Secundário (Opcional)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtítulo</label>
                <input
                  type="text"
                  value={formData.subtitle2}
                  onChange={(e) => handleInput('subtitle2', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-corporate-primary transition-all"
                  placeholder="Ex: Impacto Regional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Introdução Extra</label>
                <textarea
                  value={formData.intro2}
                  onChange={(e) => handleInput('intro2', e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-corporate-primary transition-all resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <ImageUpload
                label="Imagem Secundária"
                value={formData.image2}
                onChange={(url) => handleInput('image2', url)}
                helperText="Aparece ao lado do texto adicional."
                className="md:col-span-2"
              />
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legenda da Imagem</label>
                <input
                  type="text"
                  value={formData.caption2}
                  onChange={(e) => handleInput('caption2', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-corporate-primary transition-all"
                  placeholder="Créditos ou descrição..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Texto Adicional</label>
              <textarea
                value={formData.body2}
                onChange={(e) => handleInput('body2', e.target.value)}
                rows={6}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-corporate-primary transition-all resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media & Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-32">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <ImageIcon size={18} className="text-corporate-primary" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Média & Destaque</h3>
            </div>

            <ImageUpload
              label="Imagem de Capa (Principal)"
              value={formData.coverUrl}
              onChange={(url) => handleInput('coverUrl', url)}
              helperText="Esta é a imagem principal que aparecerá na home e no topo do artigo."
            />

            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800">
              <p className="font-bold mb-1">Dica Pro:</p>
              <p>Use imagens com boa resolução (min. 1200px largura) e formato horizontal para melhores resultados.</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NewsEditorForm;