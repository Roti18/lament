import { api } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const tracks = await api.getTracks();
    return {
        tracks
    };
};
