import React, { useState, useRef, useEffect } from 'react';
import { Globe, MessageCircle, Mail, Phone, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FloatingControls: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) setContactOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display code for current language
  const currentLangDisplay = i18n.language?.substring(0, 2).toUpperCase() || 'PT';

  return (
    <div className="fixed top-24 md:top-28 right-4 md:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">

      {/* Language Selector Container - Higher Z to overlap Contact */}
      <div className="relative pointer-events-auto z-30" ref={langRef}>
        <button
          onClick={() => { setLangOpen(!langOpen); setContactOpen(false); }}
          className="flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg px-4 py-2 rounded-full border border-slate-100 hover:bg-white transition-all group"
          aria-expanded={langOpen}
        >
          <Globe className="w-4 h-4 text-corporate-primary group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{currentLangDisplay}</span>
        </button>

        {langOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white shadow-2xl rounded-xl border border-slate-100 p-2 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-corporate-primary transition-colors"
              >
                <span>{lang.label}</span>
                {i18n.language === lang.code && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact Business Card Container - Lower Z */}
      <div className="relative pointer-events-auto z-20" ref={contactRef}>
        <button
          onClick={() => { setContactOpen(!contactOpen); setLangOpen(false); }}
          className="flex items-center gap-2 bg-corporate-primary text-white shadow-lg px-4 py-3 md:py-2 rounded-full hover:bg-sky-500 transition-all group"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Contactos</span>
        </button>

        {contactOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white shadow-2xl rounded-2xl border border-slate-100 p-6 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200 z-40">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-slate-900 font-bold text-sm">MP Trading</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Moreira & Pinheiro Group</p>
              </div>
              <button onClick={() => setContactOpen(false)} className="text-slate-300 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <a href="mailto:alex.alves@mptrading.pt" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center group-hover:bg-corporate-primary transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-xs">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Email</p>
                  <p className="text-slate-700 font-medium group-hover:text-corporate-primary transition-colors">alex.alves@mptrading.pt</p>
                </div>
              </a>

              <a href="tel:+351962825921" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center group-hover:bg-corporate-primary transition-colors">
                  <Phone className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-xs">
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Telefone</p>
                  <p className="text-slate-700 font-medium group-hover:text-corporate-primary transition-colors">+351 962 825 921</p>
                </div>
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-center">
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-[0.2em]">Alexander Alves</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default FloatingControls;