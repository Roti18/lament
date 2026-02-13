import { LAMENT_API_KEY, LAMENT_API_URL } from '$env/static/private';
import type { Track, Album, Artist, Playlist, SearchResult } from '$lib/types';

const BASE_URL = LAMENT_API_URL?.replace(/\/$/, '') || 'https://api.lament.ronxyz.xyz';

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    if (!LAMENT_API_KEY) return null;

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'x-api-key': LAMENT_API_KEY,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchAPIWithAuth<T>(path: string, token: string | undefined, options: RequestInit = {}): Promise<T | null> {
    if (!LAMENT_API_KEY) return null;

    const headers: Record<string, string> = {
        'x-api-key': LAMENT_API_KEY,
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['cookie'] = `token=${token}`;
    }

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function mapTrack(item: Record<string, unknown>): Track {
    const artists = Array.isArray(item.artists)
        ? (item.artists as Array<{ id?: string; slug?: string; name: string }>).map((a) => ({
            id: a.id || a.slug || 'unknown',
            name: a.name
        }))
        : (item.artist ? [{ id: String(item.artist_id || 'unknown'), name: String(item.artist) }] : []);

    return {
        id: String(item.id || item.slug),
        title: String(item.title),
        artists,
        album: (item.album as { title?: string })?.title || (item.album as string) || undefined,
        albumId: (item.album as { id?: string })?.id || String(item.album_id || ''),
        duration: Number(item.duration) || 0,
        coverUrl: String(item.cover_url || item.artwork_url || ''),
        coverThumb: String(item.cover_thumb || item.artwork_thumb || ''),
        audioUrl: String(item.audio_url || item.url || '')
    };
}

function mapAlbum(a: Record<string, unknown>): Album {
    return {
        id: String(a.id || a.slug),
        title: String(a.title),
        artist: (a.artist as { name?: string })?.name || String(a.artist) || 'Unknown Artist',
        artistId: (a.artist as { id?: string })?.id || String(a.artist_id || ''),
        coverUrl: String(a.cover_url || a.artwork_url || a.cover || ''),
        coverThumb: String(a.cover_thumb || a.cover_url || a.artwork_url || ''),
        releaseYear: Number(a.release_year || a.year) || undefined,
        tracks: Array.isArray(a.tracks) ? (a.tracks as Record<string, unknown>[]).map(mapTrack) : []
    };
}

function mapArtist(item: Record<string, unknown>): Artist {
    return {
        id: String(item.id || item.slug),
        name: String(item.name),
        imageUrl: item.image_url ? String(item.image_url) : undefined,
        imageThumb: item.image_thumb ? String(item.image_thumb) : undefined,
        bio: item.bio ? String(item.bio) : undefined,
        tracks: Array.isArray(item.tracks) ? (item.tracks as Record<string, unknown>[]).map(mapTrack) : [],
        albums: Array.isArray(item.albums) ? (item.albums as Record<string, unknown>[]).map(mapAlbum) : []
    };
}

function mapPlaylistTrack(t: Record<string, unknown>): Track {
    return {
        id: String(t.id),
        title: String(t.title),
        artists: t.artist_name ? [{ id: 'unknown', name: String(t.artist_name) }] : [],
        duration: Number(t.duration) || 0,
        coverUrl: t.cover_url ? String(t.cover_url) : undefined,
        coverThumb: t.cover_url ? String(t.cover_url) : undefined,
        audioUrl: t.audio_url ? String(t.audio_url) : ''
    };
}

function mapPlaylist(p: Record<string, unknown>): Playlist {
    const tracks = Array.isArray(p.tracks)
        ? (p.tracks as Record<string, unknown>[]).map(mapPlaylistTrack)
        : [];

    return {
        id: String(p.id),
        title: String(p.name || p.title),
        description: p.description ? String(p.description) : undefined,
        coverUrl: String(p.cover_url || p.image_url || p.artwork_url || ''),
        coverThumb: String(p.cover_url || p.image_thumb || p.image_url || p.artwork_url || ''),
        trackCount: Number(p.total_tracks || (Array.isArray(p.tracks) ? p.tracks.length : 0) || p.track_count) || 0,
        tracks,
        owner_id: p.user_id ? String(p.user_id) : undefined
    };
}



export const api = {
    getRandTracks: async (limit = 10): Promise<Track[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>(`/tracks/random?limit=${limit}`);
        return data?.map(mapTrack) ?? [];
    },

    getTracks: async (): Promise<Track[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>('/tracks');
        return data?.map(mapTrack) ?? [];
    },

    getRandAlbums: async (limit = 10): Promise<Album[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>(`/albums/random?limit=${limit}`);
        return data?.map(mapAlbum) ?? [];
    },

    getAlbums: async (): Promise<Album[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>('/albums');
        return data?.map(mapAlbum) ?? [];
    },

    getRandArtists: async (limit = 10): Promise<Artist[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>(`/artists/random?limit=${limit}`);
        return data?.map(mapArtist) ?? [];
    },

    getArtists: async (): Promise<Artist[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>('/artists');
        return data?.map(mapArtist) ?? [];
    },

    getCategories: async (): Promise<Playlist[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>('/categories');
        return data?.map(mapPlaylist) ?? [];
    },

    getAlbum: async (id: string): Promise<Album | null> => {
        const data = await fetchAPI<Record<string, unknown>>(`/albums/${encodeURIComponent(id)}`);
        return data ? mapAlbum(data) : null;
    },

    getArtist: async (id: string): Promise<Artist | null> => {
        const data = await fetchAPI<Record<string, unknown>>(`/artists/${encodeURIComponent(id)}`);
        return data ? mapArtist(data) : null;
    },

    getCategory: async (id: string): Promise<Playlist | null> => {
        const data = await fetchAPI<Record<string, unknown>>(`/categories/${encodeURIComponent(id)}`);
        return data ? mapPlaylist(data) : null;
    },

    getPlaylist: async (id: string, token?: string): Promise<Playlist | null> => {
        const data = await fetchAPIWithAuth<Record<string, unknown>>(`/playlists/${encodeURIComponent(id)}`, token);
        return data ? mapPlaylist(data) : null;
    },

    search: async (query: string): Promise<SearchResult> => {
        const data = await fetchAPI<Record<string, unknown>>(`/search?q=${encodeURIComponent(query)}`);
        if (!data) return { artists: [], albums: [], tracks: [] };

        return {
            artists: Array.isArray(data.artists) ? (data.artists as Record<string, unknown>[]).map(mapArtist) : [],
            albums: Array.isArray(data.albums) ? (data.albums as Record<string, unknown>[]).map(mapAlbum) : [],
            tracks: Array.isArray(data.tracks) ? (data.tracks as Record<string, unknown>[]).map(mapTrack) : []
        };
    },

    createRequest: async (body: { user_id: string; query: string; metadata?: Record<string, unknown> }) => {
        return await fetchAPI<Record<string, unknown>>('/requests', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    getTrendingTracks: async (window = '24h', limit = 20): Promise<Track[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>(`/tracks/random?limit=${limit}`);
        return data?.map(mapTrack) ?? [];
    },

    getMostPlayedTracks: async (limit = 20): Promise<Track[]> => {
        const data = await fetchAPI<Record<string, unknown>[]>(`/tracks/most-played?limit=${limit}`);
        return data?.map(mapTrack) ?? [];
    },

    recordPlay: async (trackId: string): Promise<void> => {
        await fetchAPI<void>(`/tracks/${trackId}/play`, {
            method: 'POST'
        });
    }
};
