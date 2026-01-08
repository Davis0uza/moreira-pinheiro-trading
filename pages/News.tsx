import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Loader2, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsSlider from '../components/NewsSlider';
import Values from '../components/Values';
import { publicApi, News as NewsType } from '../services/api';
import { getBackupData, getBackupImageUrl } from '../services/newsBackup';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await publicApi.listNews(1, 100);
        setNews(response.data);
        setUsingBackup(false);
      } catch (error) {
        console.error('Failed to fetch news, trying backup:', error);
        // Try to load from backup
        const backup = getBackupData();
        if (backup && backup.news.length > 0) {
          // Convert image URLs to local backup paths
          const newsWithBackupImages = backup.news.map(n => ({
            ...n,
            coverUrl: getBackupImageUrl(n.coverUrl) || n.coverUrl
          }));
          setNews(newsWithBackupImages);
          setUsingBackup(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Top 3 for slider
  const sliderNews = news.slice(0, 3);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-corporate-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 1.1 Slider */}
      <NewsSlider news={sliderNews} />

      {/* Offline Indicator */}
      {usingBackup && (
        <div className="bg-amber-50 border-b border-amber-200 py-3">
          <div className="container mx-auto px-6 flex items-center justify-center gap-2 text-amber-700 text-sm">
            <WifiOff size={16} />
            <span>A mostrar dados em cache. Algumas notícias podem não estar atualizadas.</span>
          </div>
        </div>
      )}

      {/* 1.2 Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif font-bold text-corporate-900">Últimas Notícias</h2>
            <div className="h-1 bg-corporate-accent w-24"></div>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p>Nenhuma notícia disponível de momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Link
                  to={`/news/${item.slug}`}
                  key={item.id}
                  className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 rounded-sm overflow-hidden"
                >
                  <div className="h-56 overflow-hidden relative">
                    <div className="absolute inset-0 bg-corporate-900/10 group-hover:bg-corporate-900/0 transition-colors z-10"></div>
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        Sem Imagem
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDate(item.publishedAt)}
                    </div>
                    <h3 className="text-xl font-bold text-corporate-900 mb-3 group-hover:text-corporate-accent transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.intro && (
                      <p className="text-slate-500 text-sm mb-4 line-clamp-3">{item.intro}</p>
                    )}
                    <div className="mt-auto pt-4 flex items-center text-sm font-bold text-slate-500 group-hover:text-corporate-900 transition-colors uppercase tracking-wide">
                      Ler Artigo <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 1.3 Calls */}
      <Values />
    </div>
  );
};

export default News;