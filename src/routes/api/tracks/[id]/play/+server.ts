import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
    const { id } = params;
    if (id) {
        await api.recordPlay(id);
    }
    return json({ success: true });
};
