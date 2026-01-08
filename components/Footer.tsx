import React from 'react';
import { Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900">
            <div className="container mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img
                                src="/logos/mp-logo.jpg"
                                alt="MP Trading Logo"
                                className="h-10 w-auto object-contain rounded-lg"
                            />
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            {t('footer.description')}
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.linkedin.com/company/mptradinggroup" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-corporate-accent hover:text-white transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-corporate-accent hover:text-white transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-corporate-accent hover:text-white transition-all">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-corporate-accent hover:text-white transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">{t('footer.company')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/#who-we-are" className="hover:text-corporate-accent transition-colors">{t('navbar.whoWeAre')}</a></li>
                            <li><a href="/#values" className="hover:text-corporate-accent transition-colors">{t('values.sectionTitle')}</a></li>
                            <li><a href="/news" className="hover:text-corporate-accent transition-colors">{t('navbar.news')}</a></li>
                            <li><a href="/contact" className="hover:text-corporate-accent transition-colors">{t('navbar.contacts')}</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">{t('footer.groupPartners')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Movida</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Airphoenix</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Serialplast</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">MSA Freight</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">MZ Medical</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Euroapi</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Farmanguinhos</span></li>
                            <li><span className="hover:text-corporate-accent transition-colors cursor-default">Lupin</span></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">{t('footer.support')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/contact" className="hover:text-corporate-accent transition-colors">{t('footer.talkToUs')}</a></li>
                            <li><a href="#" className="hover:text-corporate-accent transition-colors">{t('footer.privacyPolicy')}</a></li>
                            <li><a href="#" className="hover:text-corporate-accent transition-colors">{t('footer.termsOfUse')}</a></li>
                            <li><a href="tel:+351962825921" className="hover:text-corporate-accent transition-colors">+351 962 825 921</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; {new Date().getFullYear()} Moreira & Pinheiro Trading. {t('footer.allRightsReserved')}</p>
                    <a
                        href="https://bundlr.pt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 md:mt-0 opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                        <span className="text-slate-500">{t('footer.madeBy')} </span>
                        <span className="font-bold text-white">Bundlr — Group of Design and Tech Solutions</span>
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
