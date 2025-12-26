import { api } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const album = await api.getAlbum(params.id);

    if (!album) {
        error(404, 'Album not found');
    }

    return {
        album
    };
};
