/**
 * News Backup Service
 * Stores the last 10 news in localStorage for offline access
 */

import { publicApi, News } from './api';

const BACKUP_KEY = 'mptrading_news_backup';
const BACKUP_VERSION = 1;

export interface BackupData {
    news: News[];
    backupTime: string;
    version: number;
}

/**
 * Perform a backup of the latest 6 news articles with all content
 */
export const performBackup = async (): Promise<boolean> => {
    try {
        const response = await publicApi.listNews(1, 6);
        const backupData: BackupData = {
            news: response.data || [],
            backupTime: new Date().toISOString(),
            version: BACKUP_VERSION,
        };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
        console.log('[NewsBackup] Backup completed at', backupData.backupTime);
        return true;
    } catch (error) {
        console.error('[NewsBackup] Backup failed:', error);
        return false;
    }
};

/**
 * Get the backup data from localStorage
 */
export const getBackupData = (): BackupData | null => {
    try {
        const stored = localStorage.getItem(BACKUP_KEY);
        if (!stored) return null;
        const data = JSON.parse(stored) as BackupData;
        if (data.version !== BACKUP_VERSION) return null;
        return data;
    } catch {
        return null;
    }
};

/**
 * Get the timestamp of the last backup
 */
export const getLastBackupTime = (): Date | null => {
    const backup = getBackupData();
    if (!backup?.backupTime) return null;
    return new Date(backup.backupTime);
};

/**
 * Check if the backup is older than 24 hours
 */
export const isBackupStale = (): boolean => {
    const lastBackup = getLastBackupTime();
    if (!lastBackup) return true;
    const hoursSinceBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
    return hoursSinceBackup > 24;
};

/**
 * Format backup time for display
 */
export const formatBackupTime = (): string => {
    const lastBackup = getLastBackupTime();
    if (!lastBackup) return 'Nunca';
    return lastBackup.toLocaleString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Calculate milliseconds until midnight (00:00)
 */
const getMsUntilMidnight = (): number => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
};

/**
 * Initialize auto-backup system
 * Schedules backup at midnight (00:00) daily
 */
export const initAutoBackup = (): void => {
    // Perform initial backup if stale or missing
    if (isBackupStale()) {
        console.log('[NewsBackup] Backup is stale, performing initial backup...');
        performBackup();
    }

    // Schedule next backup at midnight
    const msUntilMidnight = getMsUntilMidnight();
    console.log(`[NewsBackup] Next auto-backup scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

    setTimeout(() => {
        performBackup();
        // After first midnight backup, schedule daily
        setInterval(performBackup, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
};

/**
 * Check if backend is reachable
 */
export const checkBackendStatus = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/api/news?page=1&pageSize=1', {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Get a specific news article from backup by slug
 */
export const getNewsBySlugFromBackup = (slug: string): News | null => {
    const backup = getBackupData();
    if (!backup?.news) return null;
    return backup.news.find(n => n.slug === slug) || null;
};

/**
 * Convert backend image URL to local backup path
 */
export const getBackupImageUrl = (originalUrl: string | null | undefined): string | null => {
    if (!originalUrl) return null;
    // Extract filename from URL (e.g., /api/uploads/abc123.png -> abc123.png)
    const match = originalUrl.match(/\/([^\/]+\.(png|jpg|jpeg|gif|webp))$/i);
    if (match) {
        return `/backup-images/${match[1]}`;
    }
    return originalUrl;
};
