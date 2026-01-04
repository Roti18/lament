import { error, type Cookies } from '@sveltejs/kit';
import { LAMENT_API_URL, LAMENT_API_KEY } from '$env/static/private';

const BASE_URL = LAMENT_API_URL?.replace(/\/$/, '') || 'https://api.lament.ronxyz.xyz';

interface ProxyOptions {
    request: Request;
    fetch: typeof globalThis.fetch;
    url: URL;
    cookies: Cookies;
    basePath: string;
    subPath?: string;
}

export async function proxyRequest(options: ProxyOptions): Promise<Response> {
    const { request, fetch, url, cookies, basePath, subPath } = options;
    const pathSegment = subPath ? `/${subPath}` : '';
    const targetUrl = `${BASE_URL}${basePath}${pathSegment}${url.search}`;
    console.log(`[Proxy] Forwarding ${request.method} request to: ${targetUrl}`);

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
        responseHeaders.delete('access-control-allow-origin');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    } catch (err) {
        console.error('Proxy Error:', err);
        throw error(500, 'Internal Server Error');
    }
}
