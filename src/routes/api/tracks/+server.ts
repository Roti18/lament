import { json } from '@sveltejs/kit';
import { api } from '$lib/server/api';

export async function GET() {
    const data = await api.getTracks();
    return json(data);
}
