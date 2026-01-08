import React from 'react';
import { Target, Eye, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Values: React.FC = () => {
    const { t } = useTranslation();

    const values = [
        { icon: Target, titleKey: 'values.mission', descKey: 'values.missionDesc' },
        { icon: Eye, titleKey: 'values.vision', descKey: 'values.visionDesc' },
        { icon: Shield, titleKey: 'values.values', descKey: 'values.valuesDesc' },
    ];

    return (
        <section id="values" className="py-24 bg-gradient-to-b from-slate-900 to-corporate-900 overflow-hidden">
            <div className="container mx-auto px-6">

                <div className="text-center mb-20">
                    <span className="text-corporate-primary text-xs font-bold tracking-[0.3em] uppercase">{t('values.sectionTitle')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-4">{t('values.title')}</h2>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-20">
                    {values.map((value, index) => (
                        <div key={index} className="group flex flex-col items-center text-center max-w-xs">
                            {/* Circular Container - Neutral Tones */}
                            <div className="relative mb-6">
                                {/* Subtle Glow Ring on Hover */}
                                <div className="absolute inset-0 rounded-full bg-corporate-primary/10 opacity-0 group-hover:opacity-100 blur-xl scale-125 transition-all duration-500"></div>

                                {/* Main Circle - Neutral/Corporate Style */}
                                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-lg group-hover:border-corporate-primary group-hover:shadow-xl group-hover:scale-105 transition-all duration-500 cursor-pointer">
                                    {/* Inner Ring */}
                                    <div className="absolute inset-2 rounded-full border border-slate-100 group-hover:border-corporate-primary/20 transition-colors"></div>

                                    {/* Icon */}
                                    <value.icon className="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-corporate-primary transition-colors duration-300" strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Text */}
                            <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-corporate-primary transition-colors duration-300">
                                {t(value.titleKey)}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {t(value.descKey)}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Values;
