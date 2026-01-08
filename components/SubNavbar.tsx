import React from 'react';
import { Phone, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SubNavbar: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const languages = [
    { code: 'pt', label: 'Português', display: 'PT' },
    { code: 'es', label: 'Español', display: 'ES' },
    { code: 'en', label: 'English', display: 'EN' },
    { code: 'zh', label: '中文', display: 'CN' },
  ];

  return (
    <div className="bg-corporate-900 text-gray-300 py-2 text-xs border-b border-slate-700 relative">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">

        {/* Languages */}
        <div className="flex items-center space-x-4">
          <Globe className="w-3 h-3 text-corporate-accent" />
          <div className="flex space-x-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`hover:text-white hover:underline transition-colors font-medium ${i18n.language === lang.code ? 'text-white underline' : ''}`}
                title={lang.label}
              >
                {lang.display}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-6">
          <a href="tel:+351962825921" className="flex items-center space-x-2 hover:text-corporate-accent transition-colors">
            <Phone className="w-3 h-3" />
            <span>+351 962 825 921</span>
          </a>
          <a href="mailto:alex.alves@mptrading.pt" className="flex items-center space-x-2 hover:text-corporate-accent transition-colors">
            <Mail className="w-3 h-3" />
            <span>alex.alves@mptrading.pt</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default SubNavbar;