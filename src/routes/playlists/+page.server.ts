import { api } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const playlists = await api.getCategories();
    return {
        playlists
    };
};
