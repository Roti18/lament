import { api } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const playlist = await api.getCategory(params.id);

    if (!playlist) {
        error(404, 'Playlist not found');
    }

    return {
        playlist
    };
};
