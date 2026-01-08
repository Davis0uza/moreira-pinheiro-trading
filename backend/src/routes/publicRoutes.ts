import { Router } from 'express';
import { getPublicNews, getPublicNewsBySlug } from '../controllers/publicController';
import { trackEvent } from '../controllers/analyticsController';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const router = Router();

const eventLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60, // Limit each IP to 60 requests per windowMs
    keyGenerator: (req) => ipKeyGenerator(req as any), // Fix for IPv6 key generation error
    standardHeaders: true,
    legacyHeaders: false
});

router.get('/news', getPublicNews);
router.get('/news/:slug', getPublicNewsBySlug);
router.post('/events', eventLimiter, trackEvent);

export default router;
