import { Router } from 'express';
import { login, me, logout } from '../controllers/authController';
import { listNews, createNews, getNews, updateNews, deleteNews } from '../controllers/newsController';
import { getOverview, getTimeseries, getRanking } from '../controllers/analyticsController';
import { requireAdminSession } from '../middleware/auth';
import { uploadGuard } from '../middleware/upload';
import { db } from '../db';
import { media } from '../db/schema';
import path from 'path';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5, // Limit each IP to 5 requests per windowMs
    keyGenerator: (req) => ipKeyGenerator(req as any),
    message: 'Too many login attempts, please try again after 10 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth
router.post('/auth/login', loginLimiter, login);
router.post('/auth/logout', logout); // Logout can be public or protected, but usually protected or public with cookie check? Safe to be public if it just clears cookie.
router.get('/auth/me', requireAdminSession, me);

// Protected Areas
router.use(requireAdminSession);

// News
router.get('/news', listNews);
router.post('/news', createNews);
router.get('/news/:id', getNews);
router.put('/news/:id', updateNews);
router.delete('/news/:id', deleteNews);

// Analytics
router.get('/analytics/overview', getOverview);
router.get('/analytics/timeseries', getTimeseries);
router.get('/analytics/ranking', getRanking);

// Uploads
router.post('/uploads', uploadGuard, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    // Save to DB
    const [item] = await db.insert(media).values({
        kind: 'image',
        path: req.file.filename,
        mime: req.file.mimetype,
        sizeBytes: req.file.size,
        createdByAdminId: req.adminUser!.id
    }).returning();

    // construct URL (assuming static serve or generic handler)
    const url = `/uploads/${req.file.filename}`;
    res.json({ mediaId: item.id, url, width: 0, height: 0 }); // Width/height need 'sharp', skipped strictly if not installed, but recommended.
});

export default router;
