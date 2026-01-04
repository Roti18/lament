import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LAMENT_API_URL, LAMENT_API_KEY } from '$env/static/private';

const BASE_URL = LAMENT_API_URL?.replace(/\/$/, '') || 'https://api.lament.ronxyz.xyz';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const proxy: RequestHandler = async ({ request, params, fetch, url, cookies }) => {
    const path = params.path;
    const targetUrl = `${BASE_URL}/auth/${path}${url.search}`;
    console.log(`[AuthProxy] Forwarding ${request.method} to ${targetUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout for auth

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
            const existingCookie = headers.get('cookie');
            if (existingCookie) {
                if (!existingCookie.includes('token=')) {
                    headers.set('cookie', `${existingCookie}; token=${token}`);
                }
            } else {
                headers.set('cookie', `token=${token}`);
            }
        }

        let body: any = null;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = request.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                try {
                    const text = await request.text();
                    body = text || null;
                } catch (e) {
                    console.error('[AuthProxy] Error reading request body:', e);
                }
            } else {
                body = request.body;
            }
        }

        const fetchOptions: any = {
            method: request.method,
            headers,
            body,
            signal: controller.signal
        };

        if (body && typeof body !== 'string') {
            fetchOptions.duplex = 'half';
        }

        const response = await fetch(targetUrl, fetchOptions);

        const responseHeaders = new Headers(response.headers);

        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            console.log('[AuthProxy] Received set-cookie from backend');
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
                    console.log('[AuthProxy] Token cookie set in session');
                } else {
                    cookies.delete('token', { path: '/' });
                    console.log('[AuthProxy] Token cookie deleted');
                }
            }
        }

        responseHeaders.delete('set-cookie');
        responseHeaders.delete('access-control-allow-origin');
        responseHeaders.delete('content-security-policy');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error(`[AuthProxy] Timeout for ${targetUrl}`);
            throw error(504, 'Gateway Timeout');
        }
        console.error(`[AuthProxy] Error for ${targetUrl}:`, err);
        throw error(500, `Auth Error: ${err.message || 'Unknown internal error'}`);
    } finally {
        clearTimeout(timeout);
    }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
