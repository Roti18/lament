import type { Track, Album, Artist, Playlist, SearchResult, User, SongRequest, PlaylistTrack } from '$lib/types';

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
    getTracks: () => fetchInternal<Track[]>('/tracks'),
    getAlbums: () => fetchInternal<Album[]>('/albums'),
    getArtists: () => fetchInternal<Artist[]>('/artists'),
    getCategories: () => fetchInternal<Playlist[]>('/categories'),
    search: (query: string) => fetchInternal<SearchResult>(`/search?q=${encodeURIComponent(query)}`),

    login: (credentials: { login: string; password: string }) =>
        fetchInternal<User>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    googleAuth: (token: string) =>
        fetchInternal<User>('/auth/google', { method: 'POST', body: JSON.stringify({ token }) }),
    register: (data: { username: string; email: string; password: string }) =>
        fetchInternal<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchInternal<void>('/auth/logout', { method: 'POST' }),

    getMe: () => fetchInternal<User>('/users/me'),

    getMyPlaylists: () => fetchInternal<Playlist[]>('/playlists/me'),
    getPlaylist: (id: string) => fetchInternal<Playlist>(`/playlists/${id}`),
    createPlaylist: (data: { title: string; description?: string }) =>
        fetchInternal<Playlist>('/playlists', { method: 'POST', body: JSON.stringify(data) }),
    updatePlaylist: (id: string, data: { title?: string; description?: string }) =>
        fetchInternal<Playlist>(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePlaylist: (id: string) => fetchInternal<void>(`/playlists/${id}`, { method: 'DELETE' }),

    addTrackToPlaylist: (playlistId: string, trackId: string, position?: number) =>
        fetchInternal<PlaylistTrack>('/playlist-tracks', {
            method: 'POST',
            body: JSON.stringify({ playlist_id: playlistId, track_id: trackId, position })
        }),
    removeTrackFromPlaylist: (playlistId: string, trackId: string) =>
        fetchInternal<void>(`/playlist-tracks?playlist_id=${playlistId}&track_id=${trackId}`, { method: 'DELETE' }),

    createRequest: (data: { query: string; metadata?: Record<string, unknown> }) =>
        fetchInternal<SongRequest>('/requests', { method: 'POST', body: JSON.stringify(data) }),
    getMyRequests: () => fetchInternal<SongRequest[]>('/requests/me')
};
