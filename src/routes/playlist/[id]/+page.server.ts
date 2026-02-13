import { api } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
    const token = cookies.get('token');

    let playlist = await api.getPlaylist(params.id, token);

    if (!playlist) {
        playlist = await api.getCategory(params.id);
    }

    if (!playlist) {
        error(404, 'Playlist not found');
    }

    return {
        playlist
    };
};
