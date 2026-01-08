import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Stethoscope, Factory, Building2 } from 'lucide-react';

const About: React.FC = () => {
    const { t } = useTranslation();

    const sectors = [
        { icon: Pill, titleKey: 'about.sector1Title', descKey: 'about.sector1Desc' },
        { icon: Stethoscope, titleKey: 'about.sector2Title', descKey: 'about.sector2Desc' },
        { icon: Factory, titleKey: 'about.sector3Title', descKey: 'about.sector3Desc' },
        { icon: Building2, titleKey: 'about.sector4Title', descKey: 'about.sector4Desc' },
    ];

    return (
        <section id="who-we-are" className="py-24 bg-white">
            <div className="container mx-auto px-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Text Content */}
                    <div>
                        <span className="text-corporate-primary text-xs font-bold tracking-[0.3em] uppercase">{t('about.sectionTitle')}</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-8">{t('about.title')}</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            {t('about.description1')}
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed mb-10">
                            {t('about.description2')}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 p-6 bg-slate-50 rounded-2xl">
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-corporate-primary">10+</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('about.stat1Label')}</span>
                            </div>
                            <div className="text-center border-x border-slate-200">
                                <span className="block text-3xl font-bold text-corporate-primary">Global</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('about.stat2Label')}</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-corporate-primary">4</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('about.stat3Label')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sectors Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {sectors.map((sector, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-corporate-primary/30 hover:shadow-xl transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-xl bg-corporate-primary/10 flex items-center justify-center mb-4 group-hover:bg-corporate-primary group-hover:scale-110 transition-all duration-300">
                                    <sector.icon className="text-corporate-primary group-hover:text-white transition-colors" size={26} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{t(sector.titleKey)}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{t(sector.descKey)}</p>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};

export default About;
