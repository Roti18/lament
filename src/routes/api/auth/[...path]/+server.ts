import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LAMENT_API_URL, LAMENT_API_KEY } from '$env/static/private';

const BASE_URL = LAMENT_API_URL?.replace(/\/$/, '') || 'https://api.lament.ronxyz.xyz';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const proxy: RequestHandler = async ({ request, params, fetch, url, cookies }) => {
    const path = params.path;
    const targetUrl = `${BASE_URL}/auth/${path}${url.search}`;

    try {
        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.delete('connection');
        headers.delete('content-length');

        if (LAMENT_API_KEY) {
            headers.set('x-api-key', LAMENT_API_KEY);
        }

        const token = cookies.get('token');
        if (token) {
            headers.set('cookie', `token=${token}`);
        }

        let body: string | ReadableStream<Uint8Array> | null = null;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = request.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                body = await request.text() || null;
            } else {
                body = request.body;
            }
        }

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
            duplex: 'half'
        } as RequestInit);

        const responseHeaders = new Headers(response.headers);

        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            const cookieMatch = setCookieHeader.match(/token=([^;]*)/);
            if (cookieMatch) {
                const tokenValue = cookieMatch[1];
                if (tokenValue) {
                    cookies.set('token', tokenValue, {
                        path: '/',
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                        maxAge: COOKIE_MAX_AGE
                    });
                } else {
                    cookies.delete('token', { path: '/' });
                }
            }
        }

        responseHeaders.delete('set-cookie');
        responseHeaders.delete('access-control-allow-origin');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    } catch {
        throw error(500, 'Internal Server Error');
    }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
