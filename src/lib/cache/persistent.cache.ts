interface CacheEntry<T> {
    data: T;
    expiry: number;
    etag?: string;
}

export class PersistentCache {
    private static instance: PersistentCache;
    private readonly prefix = 'lament_cache_';

    private constructor() { }

    static getInstance(): PersistentCache {
        if (!PersistentCache.instance) {
            PersistentCache.instance = new PersistentCache();
        }
        return PersistentCache.instance;
    }

    set<T>(key: string, data: T, ttlMs: number, etag?: string): void {
        if (typeof window === 'undefined') return;

        const entry: CacheEntry<T> = {
            data,
            expiry: Date.now() + ttlMs,
            etag
        };

        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (e) {
            this.clear();
        }
    }

    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;

        const raw = localStorage.getItem(this.prefix + key);
        if (!raw) return null;

        try {
            const entry: CacheEntry<T> = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                this.delete(key);
                return null;
            }
            return entry.data;
        } catch (e) {
            this.delete(key);
            return null;
        }
    }

    getWithEtag<T>(key: string): { data: T; etag?: string } | null {
        if (typeof window === 'undefined') return null;

        const raw = localStorage.getItem(this.prefix + key);
        if (!raw) return null;

        try {
            const entry: CacheEntry<T> = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                this.delete(key);
                return null;
            }
            return { data: entry.data, etag: entry.etag };
        } catch (e) {
            this.delete(key);
            return null;
        }
    }

    delete(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        if (typeof window === 'undefined') return;
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

export const persistentCache = PersistentCache.getInstance();
