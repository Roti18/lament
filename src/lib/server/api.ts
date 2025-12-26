import { LAMENT_API_KEY, LAMENT_API_URL } from '$env/static/private';
import type { Track, Album, Artist, Playlist, SearchResult } from '$lib/types';

const BASE_URL = LAMENT_API_URL?.replace(/\/$/, '') || 'https://api.lament.ronxyz.xyz';

async function fetchAPI<T>(path: string): Promise<T | null> {
    if (!LAMENT_API_KEY) {
        console.warn('LAMENT_API_KEY is missing');
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: {
                'x-api-key': LAMENT_API_KEY
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`API Error ${res.status}: ${path}`, errorText);
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error('API Fetch Failed:', err);
        return null;
    }
}

function mapTrack(item: any): Track {
    const artists = Array.isArray(item.artists)
        ? item.artists.map((a: any) => ({ id: a.id || a.slug, name: a.name }))
        : (item.artist ? [{ id: item.artist_id || 'unknown', name: item.artist }] : []);

    return {
        id: item.id || item.slug,
        title: item.title,
        artists: artists,
        album: item.album?.title || item.album || null,
        albumId: item.album?.id || item.album_id || null,
        duration: item.duration || 0,
        coverUrl: item.cover_url || item.artwork_url || null,
        coverThumb: item.cover_thumb || item.artwork_thumb || null,
        audioUrl: item.audio_url || item.url
    };
}

function mapAlbum(a: any): Album {
    return {
        id: a.id,
        title: a.title,
        artist: a.artist?.name || a.artist || 'Unknown Artist',
        artistId: a.artist?.id || a.artist_id,
        coverUrl: a.cover_url || a.artwork_url || a.cover,
        coverThumb: a.cover_thumb || a.cover_url || a.artwork_url,
        releaseYear: a.release_year || a.year,
        tracks: Array.isArray(a.tracks) ? a.tracks.map(mapTrack) : []
    };
}

function mapArtist(item: any): Artist {
    return {
        id: item.id || item.slug,
        name: item.name,
        imageUrl: item.image_url || null,
        imageThumb: item.image_thumb || null,
        bio: item.bio || null,
        tracks: Array.isArray(item.tracks) ? item.tracks.map(mapTrack) : [],
        albums: Array.isArray(item.albums) ? item.albums.map(mapAlbum) : []
    };
}

function mapPlaylist(p: any): Playlist {
    return {
        id: p.id,
        title: p.name || p.title,
        description: p.description,
        coverUrl: p.image_url || p.artwork_url,
        coverThumb: p.image_thumb || p.image_url || p.artwork_url,
        trackCount: p.tracks?.length || 0,
        tracks: Array.isArray(p.tracks) ? p.tracks.map(mapTrack) : []
    };
}

export const api = {
    getTracks: async (): Promise<Track[]> => {
        const data = await fetchAPI<any[]>('/tracks');
        return data?.map(mapTrack) || [];
    },

    getAlbums: async (): Promise<Album[]> => {
        const data = await fetchAPI<any[]>('/albums');
        return data?.map(mapAlbum) || [];
    },

    getArtists: async (): Promise<Artist[]> => {
        const data = await fetchAPI<any[]>('/artists');
        return data?.map(mapArtist) || [];
    },

    getCategories: async (): Promise<Playlist[]> => {
        const data = await fetchAPI<any[]>('/categories');
        return data?.map(mapPlaylist) || [];
    },

    getAlbum: async (id: string): Promise<Album | null> => {
        const data = await fetchAPI<any>(`/albums/${id}`);
        return data ? mapAlbum(data) : null;
    },

    getArtist: async (id: string): Promise<Artist | null> => {
        const data = await fetchAPI<any>(`/artists/${id}`);
        return data ? mapArtist(data) : null;
    },

    getCategory: async (id: string): Promise<Playlist | null> => {
        const data = await fetchAPI<any>(`/categories/${id}`);
        return data ? mapPlaylist(data) : null;
    },

    search: async (query: string): Promise<SearchResult> => {
        const data = await fetchAPI<any>(`/search?q=${encodeURIComponent(query)}`);
        if (!data) return { artists: [], albums: [], tracks: [] };

        return {
            artists: Array.isArray(data.artists) ? data.artists.map(mapArtist) : [],
            albums: Array.isArray(data.albums) ? data.albums.map(mapAlbum) : [],
            tracks: Array.isArray(data.tracks) ? data.tracks.map(mapTrack) : []
        };
    }
};
