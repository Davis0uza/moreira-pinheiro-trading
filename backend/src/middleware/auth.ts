import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { adminSessions } from '../db/schema';
import { eq, gt } from 'drizzle-orm';
import * as crypto from 'crypto';

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            adminUser?: {
                id: string;
            };
        }
    }
}

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export const requireAdminSession = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies['admin_session'];

    if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized', code: 'NO_SESSION' });
    }

    const tokenHash = hashToken(sessionId);

    try {
        const session = await db.query.adminSessions.findFirst({
            where: (sessions, { eq, and, gt, isNull }) => and(
                eq(sessions.sessionTokenHash, tokenHash),
                gt(sessions.expiresAt, new Date()),
                isNull(sessions.revokedAt)
            ),
            with: {
                // defined in schema relations if needed, but simple join logic here
            }
        });

        if (!session) {
            // Invalid or expired
            res.clearCookie('admin_session');
            return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_SESSION' });
        }

        // Success
        req.adminUser = { id: session.adminUserId };
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ error: 'Internal Auth Error' });
    }
};
