import { memoryCache } from './memory.cache';
import { persistentCache } from './persistent.cache';

export interface CacheOptions {
    ttl?: number;
    usePersistent?: boolean;
    revalidate?: boolean;
}

const DEFAULT_TTL = 1000 * 60 * 5;

export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const { ttl = DEFAULT_TTL, usePersistent = true, revalidate = true } = options;

    const memData = memoryCache.get(key);
    if (memData) {
        if (revalidate) {
            fetcher().then(freshData => {
                memoryCache.set(key, freshData);
                if (usePersistent) persistentCache.set(key, freshData, ttl);
            }).catch(() => { });
        }
        return memData;
    }

    if (usePersistent) {
        const persistedData = persistentCache.get<T>(key);
        if (persistedData) {
            memoryCache.set(key, persistedData);
            if (revalidate) {
                fetcher().then(freshData => {
                    memoryCache.set(key, freshData);
                    persistentCache.set(key, freshData, ttl);
                }).catch(() => { });
            }
            return persistedData;
        }
    }

    const data = await fetcher();
    memoryCache.set(key, data);
    if (usePersistent) persistentCache.set(key, data, ttl);

    return data;
}

export function invalidateCache(key: string): void {
    memoryCache.delete(key);
    persistentCache.delete(key);
}

export function clearAllCache(): void {
    memoryCache.clear();
    persistentCache.clear();
}
