import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const limit = Number(url.searchParams.get('limit')) || 10;
    const artists = await api.getRandArtists(limit);
    return json(artists);
};
