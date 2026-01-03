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
    getTracks: () => fetchWithCache<Track[]>('tracks', () => fetchInternal<Track[]>('/tracks')),
    getAlbums: () => fetchWithCache<Album[]>('albums', () => fetchInternal<Album[]>('/albums')),
    getArtists: () => fetchWithCache<Artist[]>('artists', () => fetchInternal<Artist[]>('/artists')),
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

    createRequest: (data: { query: string; metadata?: Record<string, unknown> }) =>
        fetchInternal<SongRequest>('/requests', { method: 'POST', body: JSON.stringify(data) }),
    getMyRequests: () => fetchWithCache<SongRequest[]>('my_requests', () => fetchInternal<SongRequest[]>('/requests/me'))
};

