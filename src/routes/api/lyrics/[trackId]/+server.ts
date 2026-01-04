import { error, json } from '@sveltejs/kit';
import { LAMENT_API_URL, LAMENT_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, url }) => {
    const { trackId } = params;

    if (!trackId) {
        throw error(400, 'Track ID is required');
    }

    try {
        const query = url.search;
        const baseUrl = LAMENT_API_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/tracks/${trackId}/lyrics${query}`, {
            headers: {
                'x-api-key': LAMENT_API_KEY
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return json({ variant: 'none', lines: [] });
            }
            throw error(response.status, 'Failed to fetch lyrics');
        }

        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error('Lyrics fetch error:', err);
        throw error(500, 'Internal Server Error');
    }
};
