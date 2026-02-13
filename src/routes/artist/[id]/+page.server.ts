import { api } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const artist = await api.getArtist(params.id);

    if (!artist) {
        error(404, 'Artist not found');
    }

    return {
        artist
    };
};
