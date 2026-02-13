import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('q');

    if (!query || !query.trim()) {
        return json({ artists: [], albums: [], tracks: [] });
    }

    try {
        const results = await api.search(query.trim());
        return json(results);
    } catch (error) {
        console.error('Search proxy error:', error);
        return json({ artists: [], albums: [], tracks: [] });
    }
};
