export class MemoryCache {
    private static instance: MemoryCache;
    private cache: Map<string, any> = new Map();

    private constructor() { }

    static getInstance(): MemoryCache {
        if (!MemoryCache.instance) {
            MemoryCache.instance = new MemoryCache();
        }
        return MemoryCache.instance;
    }

    set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    get(key: string): any {
        return this.cache.get(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export const memoryCache = MemoryCache.getInstance();
