import { Request, Response } from 'express';
import { db } from '../db';
import { news, media } from '../db/schema';
import { and, desc, eq } from 'drizzle-orm';

export const getPublicNews = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Math.min(Number(req.query.pageSize) || 12, 50);

    const rawData = await db.query.news.findMany({
        where: eq(news.status, 'published'),
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: [desc(news.publishedAt)],
        columns: {
            id: true, slug: true, title: true, intro: true, publishedAt: true, coverMediaId: true, contentJson: true
        }
    });

    // Resolve coverUrl
    const data = await Promise.all(rawData.map(async (item) => {
        let coverUrl: string | null = null;
        const content = item.contentJson as { coverUrl?: string } | null;

        if (content?.coverUrl) {
            coverUrl = content.coverUrl;
        } else if (item.coverMediaId) {
            const mediaItem = await db.query.media.findFirst({
                where: eq(media.id, item.coverMediaId),
                columns: { path: true }
            });
            if (mediaItem) coverUrl = `/uploads/${mediaItem.path}`;
        }

        // Return full contentJson for backup/offline functionality
        return { ...item, coverUrl };
    }));

    res.json({ data, page, pageSize });
};

export const getPublicNewsBySlug = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const item = await db.query.news.findFirst({
        where: and(eq(news.slug, slug), eq(news.status, 'published'))
    });

    if (!item) return res.status(404).json({ error: 'Not found' });

    let coverUrl: string | null = null;
    const content = item.contentJson as { coverUrl?: string } | null;

    if (content?.coverUrl) {
        coverUrl = content.coverUrl;
    } else if (item.coverMediaId) {
        const mediaItem = await db.query.media.findFirst({
            where: eq(media.id, item.coverMediaId),
            columns: { path: true }
        });
        if (mediaItem) coverUrl = `/uploads/${mediaItem.path}`;
    }

    res.json({ data: { ...item, coverUrl } });
};
