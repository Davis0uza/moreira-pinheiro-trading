import { Request, Response } from 'express';
import { db } from '../db';
import { adminUsers, adminSessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export const login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    const { email, password } = result.data;

    try {
        const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.email, email)
        });

        if (!admin) {
            // Generic error
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await argon2.verify(admin.passwordHash, password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create Session
        const sessionToken = uuidv4(); // High entropy
        const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        await db.insert(adminSessions).values({
            adminUserId: admin.id,
            sessionTokenHash,
            expiresAt
        });

        // Set Cookie
        res.cookie('admin_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expiresAt,
            path: '/api/admin'
        });

        res.json({ success: true, user: { id: admin.id, email: admin.email, role: admin.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
};

export const me = async (req: Request, res: Response) => {
    if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
    const admin = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, req.adminUser.id),
        columns: { id: true, email: true, role: true }
    });
    if (!admin) return res.status(401).json({ error: 'User not found' });
    res.json({ user: admin });
};

export const logout = async (req: Request, res: Response) => {
    // Ideally revoke session in DB too
    const sessionId = req.cookies['admin_session'];
    if (sessionId) {
        const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
        await db.update(adminSessions)
            .set({ revokedAt: new Date() })
            .where(eq(adminSessions.sessionTokenHash, tokenHash));
    }
    res.clearCookie('admin_session', { path: '/api/admin' });
    res.json({ success: true });
};
