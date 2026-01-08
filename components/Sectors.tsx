import React from 'react';
import { Hammer, Pill } from 'lucide-react';

const Sectors: React.FC = () => {
  return (
    <section id="sectors" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-corporate-900 mb-6">
            Setores Comerciais
          </h1>
          <p className="text-slate-600 leading-relaxed">
            A Moreira & Pinheiro Trading tem como missão oferecer produtos de alta qualidade, promovendo relações comerciais duradouras e rentáveis. A nossa expertise estende-se a áreas críticas como produtos farmacêuticos e o comércio de metais estratégicos.
          </p>
        </div>

        {/* Sub Companies Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Pharma */}
          <div className="bg-white p-10 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 group">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
              <Pill className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-corporate-900 mb-2 group-hover:text-blue-600 transition-colors">
              MedPrime Solutions
            </h3>
            <p className="text-slate-500 mb-4">Divisão Farmacêutica</p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Empresa focada em intermediação de produtos farmacêuticos e dispositivos médicos, garantindo conformidade com os mais altos padrões de saúde globais.
            </p>
          </div>

          {/* Metals */}
          <div className="bg-white p-10 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-corporate-accent group">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-corporate-accent transition-colors duration-300">
              <Hammer className="w-8 h-8 text-corporate-accent group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-corporate-900 mb-2 group-hover:text-corporate-accent transition-colors">
              MetalCore International
            </h3>
            <p className="text-slate-500 mb-4">Minerais e Metais</p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Especializada na compra e venda de metais industriais e preciosos, fornecendo matérias-primas essenciais para a indústria moderna.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Sectors;