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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.delete('connection');
        headers.delete('content-length');

        if (LAMENT_API_KEY) {
            headers.set('x-api-key', LAMENT_API_KEY);
        }

        // Ensure token cookie is passed correctly if it exists in SvelteKit cookies
        const token = cookies.get('token');
        if (token) {
            // Check if there's already a cookie header
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
                // For JSON, we read as text to avoid issues with stream reuse
                try {
                    body = await request.text();
                    if (!body || body === '') body = null;
                } catch (e) {
                    console.error('[Proxy] Error reading request body:', e);
                    body = null;
                }
            } else {
                // For other types (like multipart/form-data), we pass the stream
                body = request.body;
            }
        }

        const fetchOptions: any = {
            method: request.method,
            headers,
            body,
            signal: controller.signal
        };

        // duplex: 'half' is only needed when body is a stream
        if (body && typeof body !== 'string') {
            fetchOptions.duplex = 'half';
        }

        const response = await fetch(targetUrl, fetchOptions);

        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('access-control-allow-origin');

        // Remove security-sensitive headers that might conflict
        responseHeaders.delete('content-security-policy');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error(`[Proxy] Request timed out for: ${targetUrl}`);
            throw error(504, 'Gateway Timeout');
        }
        console.error(`[Proxy] Error for ${targetUrl}:`, err);
        throw error(500, `Internal Proxy Error: ${err.message}`);
    } finally {
        clearTimeout(timeout);
    }
}
