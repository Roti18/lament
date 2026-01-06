import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const window = url.searchParams.get('window') || '24h';
    const limit = Number(url.searchParams.get('limit')) || 20;

    const tracks = await api.getTrendingTracks(window, limit);
    return json(tracks);
};
