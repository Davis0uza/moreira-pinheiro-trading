import { Request, Response } from 'express';
import { db } from '../db';
import { news, newsMetricsDaily, uiMetricsDaily } from '../db/schema';
import { sql, eq, and, gte, desc, sum } from 'drizzle-orm';
import { z } from 'zod';

// Track Event
export const trackEvent = async (req: Request, res: Response) => {
    const schema = z.object({
        type: z.enum(['view', 'click', 'share']),
        newsId: z.string().uuid().optional(),
        slug: z.string().min(1).optional(),
        metadata: z.object({
            tag: z.string().optional()
        }).optional()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'Invalid event payload', details: result.error });
    const { type, newsId, slug, metadata } = result.data;

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. UI Click Tracking (Generic)
        if (type === 'click' && metadata?.tag) {
            await db.insert(uiMetricsDaily)
                .values({
                    date: today,
                    tag: metadata.tag,
                    clicks: 1
                })
                .onConflictDoUpdate({
                    target: [uiMetricsDaily.date, uiMetricsDaily.tag],
                    set: {
                        clicks: sql`${uiMetricsDaily.clicks} + 1`
                    }
                });
            return res.json({ success: true });
        }

        // 2. News Tracking (View/Share)
        let targetId = newsId;
        if (!targetId && slug) {
            const item = await db.query.news.findFirst({ where: eq(news.slug, slug), columns: { id: true } });
            if (item) targetId = item.id;
        }

        if (targetId && (type === 'view' || type === 'share')) {
            await db.insert(newsMetricsDaily)
                .values({
                    date: today,
                    newsId: targetId,
                    views: type === 'view' ? 1 : 0,
                    shares: type === 'share' ? 1 : 0
                })
                .onConflictDoUpdate({
                    target: [newsMetricsDaily.date, newsMetricsDaily.newsId],
                    set: {
                        views: type === 'view' ? sql`${newsMetricsDaily.views} + 1` : sql`${newsMetricsDaily.views}`,
                        shares: type === 'share' ? sql`${newsMetricsDaily.shares} + 1` : sql`${newsMetricsDaily.shares}`,
                    }
                });
            return res.json({ success: true });
        }

        // Invalid combination
        return res.status(400).json({ error: 'Invalid tracking parameters (click requires tag, news requires view/share)' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Tracking failed' });
    }
};

// Admin: Overview
export const getOverview = async (req: Request, res: Response) => {
    // defaults to 30d
    const period = req.query.period === '7d' ? 7 : req.query.period === '1y' ? 365 : 30;
    const since = new Date();
    since.setDate(since.getDate() - period);
    const sinceStr = since.toISOString().split('T')[0];

    // News Totals
    const [newsTotals] = await db.select({
        views: sum(newsMetricsDaily.views),
        shares: sum(newsMetricsDaily.shares)
    }).from(newsMetricsDaily)
        .where(gte(newsMetricsDaily.date, sinceStr));

    // UI Clicks Total
    const [uiTotals] = await db.select({
        clicks: sum(uiMetricsDaily.clicks)
    }).from(uiMetricsDaily)
        .where(gte(uiMetricsDaily.date, sinceStr));

    res.json({
        totals: {
            views: newsTotals?.views || 0,
            shares: newsTotals?.shares || 0,
            clicks: uiTotals?.clicks || 0 // Global UI clicks
        },
        period
    });
};

export const getTimeseries = async (req: Request, res: Response) => {
    const period = req.query.period === '7d' ? 7 : req.query.period === '1y' ? 365 : 30;
    const metric = (req.query.metric as 'views' | 'shares' | 'clicks') || 'views';

    const now = new Date();
    const currentSince = new Date();
    currentSince.setDate(now.getDate() - period);
    const currentSinceStr = currentSince.toISOString().split('T')[0];

    let currentData;

    if (metric === 'clicks') {
        currentData = await db.select({
            date: uiMetricsDaily.date,
            value: sum(uiMetricsDaily.clicks)
        })
            .from(uiMetricsDaily)
            .where(gte(uiMetricsDaily.date, currentSinceStr))
            .groupBy(uiMetricsDaily.date)
            .orderBy(uiMetricsDaily.date);
    } else {
        currentData = await db.select({
            date: newsMetricsDaily.date,
            value: sum(newsMetricsDaily[metric as 'views' | 'shares'])
        })
            .from(newsMetricsDaily)
            .where(gte(newsMetricsDaily.date, currentSinceStr))
            .groupBy(newsMetricsDaily.date)
            .orderBy(newsMetricsDaily.date);
    }

    // Calculate change based on start vs end of the selected period
    let changePercentage = 0;
    if (currentData.length > 0) {
        // Sort explicitly by date just to be safe, though SQL orderBy handles it
        const sorted = [...currentData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const firstValue = Number(sorted[0].value) || 0;
        const lastValue = Number(sorted[sorted.length - 1].value) || 0;

        if (firstValue > 0) {
            changePercentage = ((lastValue - firstValue) / firstValue) * 100;
        } else if (lastValue > 0) {
            // Started at 0, ended with something -> 100% growth (symbolic)
            changePercentage = 100;
        } else {
            // 0 to 0 -> 0% change
            changePercentage = 0;
        }
    }

    res.json({
        data: currentData,
        changePercentage: parseFloat(changePercentage.toFixed(1))
    });
};

// Admin: News Ranking by metric
export const getRanking = async (req: Request, res: Response) => {
    const period = req.query.period === '7d' ? 7 : req.query.period === '1y' ? 365 : 30;
    const metricParam = req.query.metric as string;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const since = new Date();
    since.setDate(since.getDate() - period);
    const sinceStr = since.toISOString().split('T')[0];

    // Case 1: Generic UI Clicks (No news relation)
    if (metricParam === 'clicks') {
        const data = await db.select({
            tag: uiMetricsDaily.tag,
            total: sum(uiMetricsDaily.clicks)
        })
            .from(uiMetricsDaily)
            .where(gte(uiMetricsDaily.date, sinceStr))
            .groupBy(uiMetricsDaily.tag)
            .orderBy(desc(sum(uiMetricsDaily.clicks)))
            .limit(limit);

        const formatted = data.map(item => ({
            newsId: 'N/A', // Generic items don't have newsId
            title: item.tag, // Use tag as title
            total: Number(item.total) || 0
        }));

        return res.json({ data: formatted, metric: 'clicks', period });
    }

    // Case 2: News Metrics (Views/Shares)
    const metric = (metricParam === 'views' || metricParam === 'shares') ? metricParam : 'views';

    const data = await db.select({
        newsId: newsMetricsDaily.newsId,
        total: sum(newsMetricsDaily[metric]),
    })
        .from(newsMetricsDaily)
        .where(gte(newsMetricsDaily.date, sinceStr))
        .groupBy(newsMetricsDaily.newsId)
        .orderBy(desc(sum(newsMetricsDaily[metric])))
        .limit(limit);

    // Enrich with news details
    const enriched = await Promise.all(data.map(async (item) => {
        const newsItem = await db.query.news.findFirst({
            where: eq(news.id, item.newsId),
            columns: { id: true, slug: true, title: true, publishedAt: true }
        });
        return {
            newsId: item.newsId,
            slug: newsItem?.slug,
            title: newsItem?.title,
            publishedAt: newsItem?.publishedAt,
            total: Number(item.total) || 0
        };
    }));

    res.json({ data: enriched, metric, period });
};
