import React from 'react';
import About from '../components/About';
import Contact from '../components/Contact';
import Location from '../components/Location';
import Values from '../components/Values';

const ContactPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* 3.1 Page Header - Banner */}
      <div className="bg-corporate-900 py-24 text-center">
        <img
          src="/logos/mp-logo.jpg"
          alt="MP Trading Logo"
          className="h-20 w-auto mx-auto mb-8 object-contain rounded-lg"
        />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
          Moreira & Pinheiro Trading
        </h1>
        <div className="w-20 h-1 bg-corporate-accent mx-auto"></div>
        <p className="text-slate-400 mt-6 max-w-xl mx-auto text-lg">
          Estamos à sua disposição para esclarecer qualquer dúvida e potenciar o seu negócio.
        </p>
      </div>

      {/* 3.2 Location Component - Mapa */}
      <Location />

      {/* Reusing Form - Forms de contactos */}
      <Contact />

      {/* Barra de valores */}
      <Values />

      {/* Componente sobre */}
      <div className="bg-gray-50 border-t border-gray-200">
        <About />
      </div>
    </div>
  );
};

export default ContactPage;