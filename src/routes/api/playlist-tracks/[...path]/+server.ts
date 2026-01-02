import type { RequestHandler } from './$types';
import { proxyRequest } from '$lib/server/proxy';

const handler: RequestHandler = async ({ request, params, fetch, url, cookies }) => {
    return proxyRequest({ request, fetch, url, cookies, basePath: '/playlist-tracks', subPath: params.path });
};

export const GET = handler;
export const DELETE = handler;
