import { pgTable, uuid, text, timestamp, integer, bigint, date, index, unique, check, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const newsStatusEnum = pgEnum('news_status', ['draft', 'published', 'archived']);

// Admin Users
export const adminUsers = pgTable('admin_users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('admin'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

// Admin Sessions
export const adminSessions = pgTable('admin_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    adminUserId: uuid('admin_user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
    sessionTokenHash: text('session_token_hash').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    ipHash: text('ip_hash'),
    userAgentHash: text('user_agent_hash'),
}, (table) => {
    return {
        userIdIdx: index('idx_admin_sessions_user').on(table.adminUserId),
        expiresIdx: index('idx_admin_sessions_expires').on(table.expiresAt),
    };
});

// Media
export const media = pgTable('media', {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull(), // 'cover', 'content_image'
    path: text('path').notNull(),
    mime: text('mime').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    width: integer('width'),
    height: integer('height'),
    sha256: text('sha256'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdByAdminId: uuid('created_by_admin_id').notNull().references(() => adminUsers.id),
}, (table) => {
    return {
        kindIdx: index('idx_media_kind').on(table.kind),
        createdAtIdx: index('idx_media_created_at').on(table.createdAt),
    };
});

// News
export const news = pgTable('news', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    intro: text('intro'),
    contentJson: jsonb('content_json').notNull(),
    status: newsStatusEnum('status').default('draft').notNull(),
    coverMediaId: uuid('cover_media_id').references(() => media.id),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdByAdminId: uuid('created_by_admin_id').notNull().references(() => adminUsers.id),
    updatedByAdminId: uuid('updated_by_admin_id').notNull().references(() => adminUsers.id),
}, (table) => {
    return {
        statusPubIdx: index('idx_news_status_published').on(table.status, table.publishedAt),
        updatedIdx: index('idx_news_updated').on(table.updatedAt),
        slugIdx: index('idx_news_slug').on(table.slug),
    };
});

// Analytics (Daily Aggregations)
// Analytics (Daily Aggregations)
export const newsMetricsDaily = pgTable('news_metrics_daily', {
    date: date('date').notNull(),
    newsId: uuid('news_id').notNull().references(() => news.id, { onDelete: 'cascade' }),
    views: integer('views').default(0).notNull(),
    shares: integer('shares').default(0).notNull(),
}, (table) => {
    return {
        pk: unique().on(table.date, table.newsId), // Composite unique constraint acting as PK equivalent logically
        newsDateIdx: index('idx_metrics_daily_news_date').on(table.newsId, table.date),
        dateIdx: index('idx_metrics_daily_date').on(table.date),
    };
});

export const uiMetricsDaily = pgTable('ui_metrics_daily', {
    date: date('date').notNull(),
    tag: text('tag').notNull(),
    clicks: integer('clicks').default(0).notNull(),
}, (table) => {
    return {
        pk: unique().on(table.date, table.tag),
        dateIdx: index('idx_ui_metrics_date').on(table.date),
    };
});
