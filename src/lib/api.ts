import type { Track, Album, Artist, Playlist, SearchResult } from '$lib/types';

async function fetchInternal<T>(path: string): Promise<T> {
    try {
        const res = await fetch(`/api${path}`);
        if (!res.ok) throw new Error('Fetch failed');
        return await res.json();
    } catch (e) {
        console.error(`Failed to fetch ${path}`, e);
        throw e;
    }
}

export const clientApi = {
    getTracks: () => fetchInternal<Track[]>('/tracks'),
    getAlbums: () => fetchInternal<Album[]>('/albums'),
    getArtists: () => fetchInternal<Artist[]>('/artists'),
    getCategories: () => fetchInternal<Playlist[]>('/categories'),
    search: (query: string) => fetchInternal<SearchResult>(`/search?q=${encodeURIComponent(query)}`)
};
