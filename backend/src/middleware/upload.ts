import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';

// Configure storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Sanitize and randomize
        const ext = path.extname(file.originalname).toLowerCase();
        // Allow gif initially for check, but later validation restricts it
        if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
            return cb(new Error('Invalid file type'), '');
        }
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid mime type'));
        }
    }
});

export const uploadGuard = (req: Request, res: Response, next: NextFunction) => {
    const handler = upload.single('file');
    handler(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'File too large (Max 5MB)', code: 'FILE_TOO_LARGE' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) return next();

        // Magic Bytes Validation
        try {
            const buffer = await fsPromises.readFile(req.file.path);
            const type = await fileTypeFromBuffer(buffer);

            // Strict list: no gif allowed in final
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!type || !allowedMimes.includes(type.mime)) {
                // Delete invalid file
                await fsPromises.unlink(req.file.path);
                return res.status(400).json({ error: 'Invalid file content (Magic Bytes mismatch)', code: 'INVALID_FILE_TYPE' });
            }
        } catch (readErr) {
            console.error('File validation error:', readErr);
            // Fail safe, delete if possible
            try { await fsPromises.unlink(req.file.path); } catch { }
            return res.status(500).json({ error: 'File validation failed' });
        }

        next();
    });
};
