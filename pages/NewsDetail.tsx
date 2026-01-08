import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, Loader2, WifiOff } from 'lucide-react';
import { publicApi, News, ContentJson } from '../services/api';
import { getNewsBySlugFromBackup, getBackupImageUrl } from '../services/newsBackup';

const NewsDetail: React.FC = () => {
    const { id: slug } = useParams<{ id: string }>(); // Route is /news/:id but we use slug
    const navigate = useNavigate();
    const [newsItem, setNewsItem] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [usingBackup, setUsingBackup] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        const loadNews = async () => {
            if (!slug) return;
            try {
                const data = await publicApi.getNewsBySlug(slug);
                setNewsItem(data.data); // Backend response wrapper { data: item }
                setUsingBackup(false);

                // Track view
                publicApi.trackEvent('view', data.data.id);
            } catch (error) {
                console.error('Failed to load news from API, trying backup:', error);
                // Try to load from backup
                const backupNews = getNewsBySlugFromBackup(slug);
                if (backupNews) {
                    // Convert image URLs to backup paths
                    const contentJson = (backupNews.contentJson || {}) as ContentJson;
                    const newsWithBackupImages = {
                        ...backupNews,
                        coverUrl: getBackupImageUrl(backupNews.coverUrl) || backupNews.coverUrl,
                        contentJson: {
                            ...contentJson,
                            body1: contentJson.body1, // Preserve body1
                            block2: contentJson.block2 ? {
                                ...contentJson.block2,
                                imageUrl: getBackupImageUrl(contentJson.block2.imageUrl) || contentJson.block2.imageUrl
                            } : undefined
                        }
                    };
                    setNewsItem(newsWithBackupImages as News);
                    setUsingBackup(true);
                }
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, [slug]);

    const handleShare = () => {
        if (newsItem) {
            // Track share
            publicApi.trackEvent('share', newsItem.id);

            // Use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: newsItem.title,
                    text: newsItem.intro,
                    url: window.location.href,
                }).catch(() => { });
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado para a área de transferência!');
            }
        }
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-corporate-primary" />
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col">
                <h2 className="text-2xl font-bold text-corporate-900 mb-4">Notícia não encontrada</h2>
                <button onClick={() => navigate('/news')} className="text-corporate-accent hover:underline">
                    Voltar para Notícias
                </button>
            </div>
        );
    }

    const content = newsItem.contentJson as ContentJson;

    return (
        <article className="bg-white min-h-screen pb-20">

            {/* 2.1 Featured Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900">
                {newsItem.coverUrl ? (
                    <img
                        src={newsItem.coverUrl}
                        alt={newsItem.title}
                        className="w-full h-full object-cover opacity-70"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 opacity-70"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto">
                    <button
                        onClick={() => navigate('/news')}
                        className="text-white/80 hover:text-white flex items-center mb-6 transition-colors text-sm uppercase tracking-widest font-bold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </button>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white max-w-4xl leading-tight mb-4">
                        {newsItem.title}
                    </h1>
                    <div className="flex items-center text-corporate-accent font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(newsItem.publishedAt)}
                    </div>
                </div>
            </div>

            {/* 2.1 Content Block */}
            <div className="container mx-auto px-6 py-16">
                <div className="max-w-3xl mx-auto">

                    {/* Intro / Lead */}
                    {newsItem.intro && (
                        <p className="text-xl text-slate-600 leading-relaxed font-serif italic mb-10 border-l-4 border-corporate-accent pl-6">
                            "{newsItem.intro}"
                        </p>
                    )}

                    {/* Main Body (Body 1) */}
                    {content.body1 && (
                        <div className="prose prose-lg prose-slate text-slate-700 leading-relaxed mb-12 whitespace-pre-wrap">
                            {content.body1}
                        </div>
                    )}

                    {/* Secondary Block */}
                    {content.block2 && (
                        <div className="mt-12">
                            {content.block2.subtitle && (
                                <h3 className="text-2xl font-bold text-corporate-900 mt-8 mb-4">{content.block2.subtitle}</h3>
                            )}

                            {content.block2.intro && (
                                <p className="text-lg text-slate-600 mb-6">{content.block2.intro}</p>
                            )}

                            {/* Middle Image */}
                            {content.block2.imageUrl && (
                                <figure className="my-12">
                                    <img
                                        src={content.block2.imageUrl}
                                        alt={content.block2.caption || "Imagem de contexto"}
                                        className="w-full rounded-sm shadow-lg"
                                    />
                                    {content.block2.caption && (
                                        <figcaption className="text-center text-sm text-slate-500 mt-3 italic">
                                            {content.block2.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            )}

                            {content.block2.body && (
                                <div className="prose prose-lg prose-slate text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {content.block2.body}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Date & Share */}
                    <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                            Publicado em {formatDate(newsItem.publishedAt)}
                        </span>
                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 text-corporate-900 hover:text-corporate-accent transition-colors font-medium"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Partilhar</span>
                        </button>
                    </div>

                </div>
            </div>
        </article>
    );
};

export default NewsDetail;