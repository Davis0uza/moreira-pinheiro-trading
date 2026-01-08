/**
* API Client for Admin Panel
* Centralized fetch wrapper with credentials and error handling
*/

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '';

// ============ DTOs ============

export interface AdminUser {
    id: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    success: boolean;
    user: AdminUser;
}

export interface MeResponse {
    user: AdminUser;
}

export interface ContentJson {
    version: 1;
    coverUrl?: string;
    body1?: string;
    block2?: {
        subtitle?: string;
        intro?: string;
        imageUrl?: string;
        caption?: string;
        body?: string;
    };
}

export interface News {
    id: string;
    slug: string;
    title: string;
    intro?: string;
    contentJson: ContentJson;
    status: 'draft' | 'published' | 'archived';
    coverMediaId?: string | null;
    coverUrl?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NewsListResponse {
    data: News[];
    page: number;
    pageSize: number;
    total: number;
}

export interface AnalyticsOverview {
    totals: {
        views: number | null;
        clicks: number | null;
        shares: number | null;
    };
    period: number;
}

export interface TimeseriesPoint {
    date: string;
    value: number | null;
}

export interface TimeseriesResponse {
    data: TimeseriesPoint[];
    changePercentage?: number;
}

export interface RankingItem {
    newsId: string;
    slug?: string;
    title?: string;
    publishedAt?: string;
    tag?: string; // For generic UI metrics
    total: number;
}

export interface RankingResponse {
    data: RankingItem[];
    metric: string;
    period: number;
}

export interface UploadResponse {
    mediaId: string;
    url: string;
    width: number;
    height: number;
}

// ============ API Error ============

export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ============ Fetch Helper ============

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/admin${path}`;

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Handle 401 - redirect to login
        if (response.status === 401) {
            window.location.href = '/adminauth';
            throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
        }

        // Parse error response
        let errorData: { error?: string; code?: string; details?: unknown } = {};
        try {
            errorData = await response.json();
        } catch {
            // Ignore JSON parse error
        }

        throw new ApiError(
            response.status,
            errorData.code || 'UNKNOWN_ERROR',
            errorData.error || `Request failed with status ${response.status}`,
            errorData.details
        );
    }

    return response.json();
}

// ============ Auth API ============

export const authApi = {
    login: (email: string, password: string) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () =>
        apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),

    me: () =>
        apiFetch<MeResponse>('/auth/me'),
};

// ============ News API ============

export interface CreateNewsPayload {
    title: string;
    slug?: string;
    intro?: string;
    contentJson: ContentJson;
    status?: 'draft' | 'published' | 'archived';
    coverMediaId?: string | null;
}

export interface UpdateNewsPayload extends Partial<CreateNewsPayload> { }

export const newsApi = {
    list: (params?: { page?: number; pageSize?: number; q?: string; status?: string }) => {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.pageSize) query.set('pageSize', String(params.pageSize));
        if (params?.q) query.set('q', params.q);
        if (params?.status) query.set('status', params.status);
        const queryStr = query.toString();
        return apiFetch<NewsListResponse>(`/news${queryStr ? `?${queryStr}` : ''}`);
    },

    get: (id: string) =>
        apiFetch<News>(`/news/${id}`),

    create: (payload: CreateNewsPayload) =>
        apiFetch<News>('/news', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: string, payload: UpdateNewsPayload) =>
        apiFetch<News>(`/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),

    delete: (id: string) =>
        apiFetch<{ success: boolean }>(`/news/${id}`, { method: 'DELETE' }),
};

// ============ Analytics API ============

export const analyticsApi = {
    overview: (period: '7d' | '30d' | '1y' = '30d') =>
        apiFetch<AnalyticsOverview>(`/analytics/overview?period=${period}`),

    timeseries: (params: { period?: '7d' | '30d' | '1y'; metric?: 'views' | 'clicks' | 'shares' }) => {
        const query = new URLSearchParams();
        if (params.period) query.set('period', params.period);
        if (params.metric) query.set('metric', params.metric);
        return apiFetch<TimeseriesResponse>(`/analytics/timeseries?${query.toString()}`);
    },

    ranking: (params: { metric?: 'views' | 'clicks' | 'shares'; period?: '7d' | '30d' | '1y'; limit?: number }) => {
        const query = new URLSearchParams();
        if (params.metric) query.set('metric', params.metric);
        if (params.period) query.set('period', params.period);
        if (params.limit) query.set('limit', String(params.limit));
        return apiFetch<RankingResponse>(`/analytics/ranking?${query.toString()}`);
    },
};

// ============ Upload API ============

export const uploadApi = {
    upload: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            // Don't set Content-Type for FormData
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/adminauth';
                throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(response.status, 'UPLOAD_FAILED', errorData.error || 'Upload failed');
        }

        return response.json();
    },
};

// ============ Public API ============

export const publicApi = {
    listNews: (page: number = 1, pageSize: number = 12) =>
        fetch(`${API_BASE_URL}/api/news?page=${page}&pageSize=${pageSize}`).then(res => res.json()),

    getNewsBySlug: (slug: string) =>
        fetch(`${API_BASE_URL}/api/news/${slug}`).then(async res => {
            if (!res.ok) throw new Error('Not found');
            return res.json();
        }),

    trackEvent: (type: 'view' | 'click' | 'share', newsId?: string, metadata?: any) =>
        fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, newsId, metadata })
        }).catch(err => console.error('Tracking error:', err)),

    submitContact: (data: { name: string; email: string; phone?: string; message: string }) =>
        fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Failed to submit contact');
            return res.json();
        }),
};
