import type { Track, Album, Artist, Playlist, SearchResult, User, SongRequest, PlaylistTrack } from '$lib/types';
import { fetchWithCache, invalidateCache } from './cache/api.client';

async function fetchInternal<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!res.ok) {
        let errorData;
        try {
            errorData = await res.json();
        } catch {
            errorData = { message: res.statusText };
        }
        throw new Error(errorData.message || errorData.error || `Fetch failed: ${res.statusText}`);
    }

    if (res.status === 204) return {} as T;
    return await res.json();
}

export const clientApi = {
    getTracks: (limit = 10) => fetchWithCache<Track[]>('tracks', () => fetchInternal<Track[]>(`/tracks?limit=${limit}`)),
    getTrendingTracks: (window = '24h', limit = 20) => fetchWithCache<Track[]>('tracks_trending', () => fetchInternal<Track[]>(`/tracks/trending?window=${window}&limit=${limit}`), { ttl: 1000 * 60 * 5 }),
    getMostPlayedTracks: (limit = 20) => fetchWithCache<Track[]>('tracks_most_played', () => fetchInternal<Track[]>(`/tracks/most-played?limit=${limit}`), { ttl: 1000 * 60 * 15 }),
    getAlbums: (limit = 10) => fetchWithCache<Album[]>('albums', () => fetchInternal<Album[]>(`/albums?limit=${limit}`)),
    getArtists: (limit = 10) => fetchWithCache<Artist[]>('artists', () => fetchInternal<Artist[]>(`/artists?limit=${limit}`)),
    getCategories: () => fetchWithCache<Playlist[]>('categories', () => fetchInternal<Playlist[]>('/categories')),
    search: (query: string) =>
        fetchWithCache<SearchResult>(`search_${query}`, () => fetchInternal<SearchResult>(`/search?q=${encodeURIComponent(query)}`)),

    login: async (credentials: { login: string; password: string }) => {
        const user = await fetchInternal<User>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
        invalidateCache('me');
        return user;
    },
    googleAuth: async (token: string) => {
        const user = await fetchInternal<User>('/auth/google', { method: 'POST', body: JSON.stringify({ token }) });
        invalidateCache('me');
        return user;
    },
    register: async (data: { username: string; email: string; password: string }) => {
        const user = await fetchInternal<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
        invalidateCache('me');
        return user;
    },
    logout: async () => {
        await fetchInternal<void>('/auth/logout', { method: 'POST' });
        invalidateCache('me');
    },

    getMe: () => fetchWithCache<User>('me', () => fetchInternal<User>('/users/me'), { ttl: 1000 * 60 * 30 }),

    getMyPlaylists: () => fetchWithCache<Playlist[]>('my_playlists', () => fetchInternal<Playlist[]>('/playlists/me')),
    getPlaylist: (id: string) => fetchWithCache<Playlist>(`playlist_${id}`, () => fetchInternal<Playlist>(`/playlists/${id}`)),

    createPlaylist: async (data: { title: string; description?: string }) => {
        const playlist = await fetchInternal<Playlist>('/playlists', { method: 'POST', body: JSON.stringify(data) });
        invalidateCache('my_playlists');
        return playlist;
    },
    updatePlaylist: async (id: string, data: { title?: string; description?: string }) => {
        const playlist = await fetchInternal<Playlist>(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        invalidateCache(`playlist_${id}`);
        invalidateCache('my_playlists');
        return playlist;
    },
    deletePlaylist: async (id: string) => {
        await fetchInternal<void>(`/playlists/${id}`, { method: 'DELETE' });
        invalidateCache(`playlist_${id}`);
        invalidateCache('my_playlists');
    },

    addTrackToPlaylist: async (playlistId: string, trackId: string, position?: number) => {
        const result = await fetchInternal<PlaylistTrack>('/playlist-tracks', {
            method: 'POST',
            body: JSON.stringify({ playlist_id: playlistId, track_id: trackId, position })
        });
        invalidateCache(`playlist_${playlistId}`);
        return result;
    },
    removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
        await fetchInternal<void>(`/playlist-tracks?playlist_id=${playlistId}&track_id=${trackId}`, { method: 'DELETE' });
        invalidateCache(`playlist_${playlistId}`);
    },

    createRequest: async (data: { query: string; metadata?: Record<string, unknown> }) => {
        const res = await fetchInternal<SongRequest>('/requests', { method: 'POST', body: JSON.stringify(data) });
        invalidateCache('my_requests');
        return res;
    },
    getMyRequests: () => fetchWithCache<SongRequest[]>('my_requests', () => fetchInternal<SongRequest[]>('/requests/me')),

    recordPlay: async (trackId: string) => {
        try {
            await fetchInternal<void>(`/tracks/${trackId}/play`, { method: 'POST' });
        } catch (e) {
            console.error('Failed to record play:', e);
        }
    }
};

