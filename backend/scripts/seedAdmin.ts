/**
 * Admin Seed Script
 * Creates an initial admin user for development.
 * 
 * Usage:
 *   Set environment variables and run:
 *   ADMIN_SEED_EMAIL=admin@example.com ADMIN_SEED_PASSWORD=yourpassword npx ts-node scripts/seedAdmin.ts
 * 
 * Only runs in development mode (NODE_ENV !== 'production')
 */

import 'dotenv/config';
import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Cannot run seed in production mode');
        process.exit(1);
    }

    const email = process.env.ADMIN_SEED_EMAIL || 'admin@mptrading.com';
    const password = process.env.ADMIN_SEED_PASSWORD || 'admin123';

    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters');
        process.exit(1);
    }

    try {
        // Check if admin already exists
        const existing = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.email, email)
        });

        if (existing) {
            console.log(`⚠️  Admin user ${email} already exists`);
            process.exit(0);
        }

        // Hash password
        const passwordHash = await argon2.hash(password);

        // Insert admin
        const [admin] = await db.insert(adminUsers).values({
            email,
            passwordHash,
            role: 'admin'
        }).returning();

        console.log(`✅ Admin user created:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed admin:', error);
        process.exit(1);
    }
}

seedAdmin();
