import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const limit = Number(url.searchParams.get('limit')) || 20;

    const tracks = await api.getMostPlayedTracks(limit);
    return json(tracks);
};
