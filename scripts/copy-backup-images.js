/**
 * Script to copy news images from backend/uploads to public/backup-images
 * Run with: node scripts/copy-backup-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '..', 'backend', 'uploads');
const DEST_DIR = path.join(__dirname, '..', 'public', 'backup-images');

// Create destination directory if it doesn't exist
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
    console.log('Created directory:', DEST_DIR);
}

// Check if source directory exists
if (!fs.existsSync(SOURCE_DIR)) {
    console.error('Source directory does not exist:', SOURCE_DIR);
    process.exit(1);
}

// Copy all image files
const files = fs.readdirSync(SOURCE_DIR);
let copied = 0;

files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
        const src = path.join(SOURCE_DIR, file);
        const dest = path.join(DEST_DIR, file);

        try {
            fs.copyFileSync(src, dest);
            copied++;
            console.log('Copied:', file);
        } catch (err) {
            console.error('Failed to copy', file, err.message);
        }
    }
});

console.log(`\n✅ Backup complete: ${copied} images copied to public/backup-images/`);
