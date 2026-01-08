import { Request, Response } from 'express';
import { db } from '../db';
import { news, media, newsStatusEnum } from '../db/schema';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

// Versioned contentJson schema for news articles
const contentJsonSchema = z.object({
    version: z.literal(1).default(1),
    coverUrl: z.string().optional(), // External URL for cover image
    body1: z.string().optional(), // Main content paragraph
    block2: z.object({
        subtitle: z.string().optional(),
        intro: z.string().optional(),
        imageUrl: z.string().optional(),
        caption: z.string().optional(),
        body: z.string().optional(),
    }).optional(),
}).strict();

const createNewsSchema = z.object({
    title: z.string().min(3),
    slug: z.string().min(3).optional(),
    intro: z.string().optional(),
    contentJson: contentJsonSchema,
    status: z.enum(['draft', 'published', 'archived']).optional(),
    coverMediaId: z.string().uuid().optional().nullable()
});

export const listNews = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const q = req.query.q as string;
    const status = req.query.status as 'draft' | 'published' | 'archived' | undefined;

    const where = and(
        status ? eq(news.status, status) : undefined,
        q ? ilike(news.title, `%${q}%`) : undefined
    );

    const rawData = await db.query.news.findMany({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: [desc(news.updatedAt)],
    });

    // Resolve coverUrl for each item
    const data = await Promise.all(rawData.map(async (item) => {
        let coverUrl: string | null = null;

        // Priority 1: External URL in contentJson
        const content = item.contentJson as { coverUrl?: string } | null;
        if (content?.coverUrl) {
            coverUrl = content.coverUrl;
        }
        // Priority 2: Uploaded media
        else if (item.coverMediaId) {
            const mediaItem = await db.query.media.findFirst({
                where: eq(media.id, item.coverMediaId),
                columns: { path: true }
            });
            if (mediaItem) {
                coverUrl = `/uploads/${mediaItem.path}`;
            }
        }

        return { ...item, coverUrl };
    }));

    // Get total count for pagination
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
        .from(news)
        .where(where);

    res.json({ data, page, pageSize, total: count });
};

export const getNews = async (req: Request, res: Response) => {
    const id = req.params.id;
    const item = await db.query.news.findFirst({ where: eq(news.id, id) });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
};

export const createNews = async (req: Request, res: Response) => {
    const result = createNewsSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const { title, slug, intro, contentJson, status, coverMediaId } = result.data;

    // Generate slug if missing
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await db.query.news.findFirst({ where: eq(news.slug, finalSlug) });
    if (exists) finalSlug += `-${Date.now()}`;

    const [newItem] = await db.insert(news).values({
        title,
        slug: finalSlug,
        intro,
        contentJson,
        status: status || 'draft',
        coverMediaId,
        createdByAdminId: req.adminUser!.id,
        updatedByAdminId: req.adminUser!.id,
        publishedAt: status === 'published' ? new Date() : null
    }).returning();

    res.json(newItem);
};

const updateNewsSchema = z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    intro: z.string().optional(),
    contentJson: contentJsonSchema.optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    coverMediaId: z.string().uuid().optional().nullable()
}).strict(); // Reject unknown keys

export const updateNews = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Zod Validation
    const result = updateNewsSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error, code: 'VALIDATION_ERROR' });
    }

    // Check for empty update
    if (Object.keys(result.data).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const { title, intro, contentJson, status, coverMediaId, slug } = result.data;

    // Optional: Check slug uniqueness if changed
    if (slug) {
        const exists = await db.query.news.findFirst({ where: and(eq(news.slug, slug), sql`${news.id} != ${id}`) });
        if (exists) return res.status(409).json({ error: 'Slug already exists' });
    }

    const [updated] = await db.update(news)
        .set({
            title, intro, contentJson, status, coverMediaId, slug,
            updatedAt: new Date(),
            updatedByAdminId: req.adminUser!.id,
            publishedAt: status === 'published' ? sql`COALESCE(published_at, NOW())` : undefined
        })
        .where(eq(news.id, id))
        .returning();

    res.json(updated);
};

export const deleteNews = async (req: Request, res: Response) => {
    const id = req.params.id;
    await db.update(news).set({ status: 'archived' }).where(eq(news.id, id));
    res.json({ success: true });
};
