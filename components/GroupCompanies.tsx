import React from 'react';
import { useTranslation } from 'react-i18next';

const companies = [
  { name: 'Movida', logo: '/logos/movida.png' },
  { name: 'Airphoenix', logo: '/logos/airphoenix.png' },
  { name: 'Serialplast', logo: '/logos/serialplast.png' },
  { name: 'MSA Freight', logo: '/logos/msa.png' },
  { name: 'MZ Medical', logo: '/logos/mzmedical.png' },
  { name: 'Euroapi', logo: '/logos/euroapi.png' },
  { name: 'Farmanguinhos', logo: '/logos/farmanguinhos.png' },
  { name: 'Lupin', logo: '/logos/lupin.png' },
];

const GroupCompanies: React.FC = () => {
  const { t } = useTranslation();

  // Duplicate for seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section id="group-companies" className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-corporate-primary text-xs font-bold tracking-[0.3em] uppercase">{t('groupCompanies.sectionTitle')}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">{t('groupCompanies.title')}</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">{t('groupCompanies.subtitle')}</p>
        </div>

      </div>

      {/* Infinite Scroll Slider */}
      <div className="relative">
        {/* Gradient Fade Left */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>

        {/* Gradient Fade Right */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Track */}
        <div className="flex animate-scroll hover:[animation-play-state:paused]">
          {duplicatedCompanies.map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 group"
            >
              <div className="w-40 h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-4 grayscale hover:grayscale-0 hover:shadow-lg hover:border-corporate-primary/20 hover:scale-105 transition-all duration-500 cursor-pointer">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-12 max-w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<span class="text-slate-400 font-bold text-sm text-center">${company.name}</span>`;
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Description */}
      <div className="container mx-auto px-6 mt-16">
        <p className="text-center text-slate-600 max-w-4xl mx-auto leading-relaxed text-lg">
          {t('groupCompanies.description')}
        </p>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default GroupCompanies;
