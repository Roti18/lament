import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase64url } from '@oslojs/encoding';
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export interface User {
	id: string;
	username: string;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
	return {
		id: 'stub-session-id',
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	return { session: null, user: null };
}

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

export async function invalidateSession(sessionId: string) {
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
