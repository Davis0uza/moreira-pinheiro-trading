import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { publicApi } from '../services/api';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = (label: string) => {
    // Sanitize label for tag
    const tag = `nav_${label.toLowerCase().replace(/ & /g, '_').replace(/[\s\?]/g, '')}`;
    publicApi.trackEvent('click', undefined, { tag });
  };

  const links = [
    { label: t('navbar.whoWeAre'), href: '/#who-we-are' },
    { label: t('navbar.groupCompanies'), href: '/#group-companies' },
    { label: t('navbar.news'), href: '/news' },
    { label: t('navbar.contacts'), href: '/contact' },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3' : 'bg-white py-5'
      }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => handleTrack('logo')}>
          <img
            src="/logos/mp-logo.jpg"
            alt="MP Trading Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-[#004b6a] group-hover:text-[#0b1c26] transition-colors font-bold text-lg leading-tight tracking-tight uppercase">Moreira & Pinheiro</span>
            <span className="text-corporate-primary text-[10px] font-bold tracking-[0.2em] uppercase">Trading Group</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10">
          {links.map((link) => {
            const isAnchor = link.href.startsWith('/#');
            return (
              <div key={link.label}>
                {isAnchor ? (
                  <a
                    href={link.href}
                    onClick={() => handleTrack(link.label)}
                    className="text-slate-600 hover:text-corporate-primary font-semibold text-[11px] uppercase tracking-[0.15em] transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => handleTrack(link.label)}
                    className={`font-semibold text-[11px] uppercase tracking-[0.15em] transition-colors ${location.pathname === link.href ? 'text-corporate-primary' : 'text-slate-600 hover:text-corporate-primary'}`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-slate-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-2xl">
          <div className="flex flex-col px-6 py-6 space-y-6">
            {links.map((link) => (
              link.href.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-700 font-bold text-sm uppercase tracking-widest hover:text-corporate-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-slate-700 font-bold text-sm uppercase tracking-widest hover:text-corporate-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;