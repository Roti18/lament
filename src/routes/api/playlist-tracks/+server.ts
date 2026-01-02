import type { RequestHandler } from './$types';
import { proxyRequest } from '$lib/server/proxy';

const handler: RequestHandler = async ({ request, fetch, url, cookies }) => {
    return proxyRequest({ request, fetch, url, cookies, basePath: '/playlist-tracks' });
};

export const GET = handler;
export const POST = handler;
