import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { News } from '../services/api';

interface NewsSliderProps {
  news: News[];
}

const NewsSlider: React.FC<NewsSliderProps> = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (news.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  const prevSlide = () => {
    if (news.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const nextSlide = () => {
    if (news.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!news.length) return null;

  return (
    <div className="relative w-full h-[500px] bg-slate-900 overflow-hidden group">

      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {news.map((item) => (
          <div key={item.id} className="w-full flex-shrink-0 h-full relative">
            {item.coverUrl ? (
              <img
                src={item.coverUrl}
                alt={item.title}
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 opacity-50"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-corporate-900 via-transparent to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3">
              <div className="flex items-center text-corporate-accent text-sm font-bold mb-3 uppercase tracking-wider">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(item.publishedAt)}
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-4 leading-tight">
                {item.title}
              </h2>
              <p className="text-gray-300 mb-8 line-clamp-2 text-lg">
                {item.intro || "Clique para ler mais detalhes sobre esta notícia importante da Moreira & Pinheiro Trading."}
              </p>
              <Link
                to={`/news/${item.slug}`}
                className="bg-corporate-accent hover:bg-yellow-600 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest transition-colors inline-block"
              >
                Ler Mais
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-corporate-accent text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-corporate-accent text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 right-8 flex space-x-2">
        {news.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-corporate-accent w-8' : 'bg-white/50 hover:bg-white'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsSlider;