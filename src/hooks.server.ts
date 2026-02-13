import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Auth system has been removed
	event.locals.user = null;
	event.locals.session = null;

	const response = await resolve(event);

	// Required for Google Auth popups if they were ever used, but safe to keep or remove.
	// We'll keep it for general security compatibility.
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

	return response;
};
