import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle, AlertCircle, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { publicApi } from '../services/api';

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await publicApi.submitContact(formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section id="contact" className="py-24 bg-slate-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">

                <div className="text-center mb-16">
                    <span className="text-corporate-primary text-xs font-bold tracking-[0.3em] uppercase">{t('contact.sectionTitle')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">{t('contact.title')}</h2>
                    <p className="text-slate-600 mt-4 max-w-xl mx-auto">{t('contact.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

                    {/* Business Card Style Contact Info */}
                    <div className="flex flex-col justify-center">
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-10 relative overflow-hidden group">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-corporate-primary/5 rounded-bl-full"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-corporate-accent/5 rounded-tr-full"></div>

                            {/* Logo & Company Name */}
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                <img
                                    src="/logos/mp-logo.jpg"
                                    alt="MP Trading Logo"
                                    className="h-16 w-auto object-contain rounded-lg shadow-md"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Moreira & Pinheiro</h3>
                                    <p className="text-corporate-primary text-xs font-bold uppercase tracking-[0.2em]">Trading Group</p>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-5">
                                <a href="mailto:alex.alves@mptrading.pt" className="flex items-center gap-4 group/item hover:translate-x-2 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover/item:bg-corporate-primary transition-colors">
                                        <Mail className="w-5 h-5 text-slate-500 group-hover/item:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Email</p>
                                        <p className="text-slate-700 font-medium">alex.alves@mptrading.pt</p>
                                    </div>
                                </a>

                                <a href="tel:+351962825921" className="flex items-center gap-4 group/item hover:translate-x-2 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover/item:bg-corporate-primary transition-colors">
                                        <Phone className="w-5 h-5 text-slate-500 group-hover/item:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Telefone</p>
                                        <p className="text-slate-700 font-medium">+351 962 825 921</p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Morada</p>
                                        <p className="text-slate-700 font-medium">Rua C, Nº 12, Escritório 7</p>
                                        <p className="text-slate-500 text-sm">2685-011 Prior Velho, Lisboa</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider with Name */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-900 font-bold">Alexander Alves</p>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Diretor</p>
                                </div>
                                <a
                                    href="https://www.linkedin.com/company/mptradinggroup"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-corporate-primary transition-colors"
                                >
                                    <Linkedin className="w-4 h-4 text-white" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="bg-white shadow-xl border border-slate-200 p-8 md:p-10 rounded-3xl space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('contact.formName')}</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-corporate-primary/50 focus:border-corporate-primary transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('contact.formEmail')}</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-corporate-primary/50 focus:border-corporate-primary transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('contact.formPhone')}</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-corporate-primary/50 focus:border-corporate-primary transition-all"
                                    placeholder="+351 000 000 000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('contact.formMessage')}</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-corporate-primary/50 focus:border-corporate-primary transition-all resize-none"
                                placeholder={t('contact.formMessage')}
                            ></textarea>
                        </div>

                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                <CheckCircle size={18} />
                                <span className="text-sm font-medium">{t('contact.formSuccess')}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">{t('contact.formError')}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-gradient-to-r from-corporate-primary to-sky-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:from-sky-500 hover:to-corporate-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-corporate-primary/25 hover:shadow-xl hover:shadow-corporate-primary/30"
                        >
                            {status === 'sending' ? t('contact.formSubmitting') : t('contact.formSubmit')}
                            <Send size={16} />
                        </button>
                    </form>

                </div>
            </div>
        </section>
    );
};

export default Contact;
