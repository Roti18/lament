import { onMount } from 'svelte';
import { memoryCache } from './memory.cache';
import { persistentCache } from './persistent.cache';

export function useCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; usePersistent?: boolean } = {}
) {
    let data = $state<T | null>(null);
    let loading = $state(true);
    let error = $state<any>(null);

    const { ttl = 1000 * 60 * 5, usePersistent = true } = options;

    const load = async () => {
        try {
            const memData = memoryCache.get(key);
            if (memData) {
                data = memData;
                loading = false;

                fetcher().then(freshData => {
                    data = freshData;
                    memoryCache.set(key, freshData);
                    if (usePersistent) persistentCache.set(key, freshData, ttl);
                });
                return;
            }

            if (usePersistent) {
                const persistedData = persistentCache.get<T>(key);
                if (persistedData) {
                    data = persistedData;
                    loading = false;
                    memoryCache.set(key, persistedData);

                    fetcher().then(freshData => {
                        data = freshData;
                        memoryCache.set(key, freshData);
                        persistentCache.set(key, freshData, ttl);
                    });
                    return;
                }
            }

            const freshData = await fetcher();
            data = freshData;
            memoryCache.set(key, freshData);
            if (usePersistent) persistentCache.set(key, freshData, ttl);
        } catch (e) {
            error = e;
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        load();
    });

    return {
        get data() { return data; },
        get loading() { return loading; },
        get error() { return error; },
        revalidate: load
    };
}
