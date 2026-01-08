import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicApi, News } from '../services/api';
import { getBackupData, getBackupImageUrl } from '../services/newsBackup';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [recentNews, setRecentNews] = useState<News[]>([]);

  useEffect(() => {
    publicApi.listNews(1, 3)
      .then(res => setRecentNews(res.data))
      .catch(() => {
        // Fallback to backup data
        const backup = getBackupData();
        if (backup?.news) {
          // Use backup news with converted image URLs
          const newsWithBackupImages = backup.news.slice(0, 3).map(n => ({
            ...n,
            coverUrl: getBackupImageUrl(n.coverUrl) || n.coverUrl
          }));
          setRecentNews(newsWithBackupImages);
        }
      });
  }, []);

  const handleTrack = (tag: string) => {
    publicApi.trackEvent('click', undefined, { tag });
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center">
      <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 transition-opacity duration-1000"
        >
          <source src="/background-trading.mp4" type="video/mp4" />
          <img
            src="https://images.unsplash.com/photo-1587854230147-86621f3235dd?auto=format&fit=crop&q=80&w=1920"
            alt="Logistics Background"
            className="w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-corporate-900/40 to-slate-950"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 py-24">
        <div className="flex flex-col gap-20">

          {/* Main Content Area */}
          <div className="max-w-4xl animate-fade-in-up">
            <span className="inline-block py-1 px-4 rounded-full bg-corporate-primary/20 text-corporate-primary text-[10px] font-bold tracking-[0.2em] mb-6 border border-corporate-primary/30 uppercase">
              {t('hero.tagline')}
            </span>
            <h1 className="text-4xl md:text-7xl font-serif text-white font-bold leading-tight mb-8">
              {t('hero.title1')} <br />
              <span className="text-corporate-primary">{t('hero.title2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#who-we-are"
                onClick={() => handleTrack('hero_saiba_mais')}
                className="group bg-corporate-primary text-white px-8 py-4 rounded-lg shadow-xl shadow-corporate-primary/20 font-bold uppercase tracking-widest hover:bg-sky-500 transition-all flex items-center gap-3"
              >
                {t('hero.ctaDiscover')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/contact"
                onClick={() => handleTrack('hero_contacts')}
                className="bg-white/5 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                {t('hero.ctaContact')}
              </Link>
            </div>
          </div>

          {/* Latest News Featured Row */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-bold text-xs uppercase tracking-[0.3em]">{t('news.pageTitle')}</h3>
                <div className="h-[1px] w-12 bg-corporate-primary/50 hidden md:block"></div>
              </div>
              <Link to="/news" className="text-corporate-primary hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                {t('news.readMore')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNews.map((news) => (
                <Link
                  key={news.id}
                  to={`/news/${news.slug}`}
                  className="group relative flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-corporate-primary/40 hover:shadow-2xl hover:shadow-black/20"
                >
                  {/* News Thumbnail */}
                  <div className="h-44 w-full overflow-hidden relative">
                    {news.coverUrl ? (
                      <img
                        src={news.coverUrl}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  </div>

                  {/* News Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-corporate-primary text-[10px] font-bold uppercase mb-3 tracking-widest">
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDate(news.publishedAt)}
                    </div>
                    <h4 className="text-white font-bold text-base leading-snug group-hover:text-corporate-primary transition-colors mb-4 line-clamp-2">
                      {news.title}
                    </h4>
                    <div className="mt-auto flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest group-hover:text-white transition-colors">
                      {t('news.readMore')} <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;