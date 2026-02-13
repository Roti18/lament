import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const limit = Number(url.searchParams.get('limit')) || 10;
    const random = url.searchParams.get('random') === 'true';

    const tracks = random ? await api.getRandTracks(limit) : await api.getTracks();
    return json(tracks);
};
