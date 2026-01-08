import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Global Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // frontend URL
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Static Uploads (Protected or Public? Requirement says "backend validation... storage on disk". Usually images are public)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
