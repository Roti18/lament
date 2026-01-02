import { browser } from '$app/environment';
import { clientApi } from '$lib/api';
import type { User } from '$lib/types';

let user = $state<User | null>(null);
let initialized = $state(false);

export const auth = {
    get user() {
        return user;
    },
    get isAuthenticated() {
        return !!user;
    },
    get isInitialized() {
        return initialized;
    },

    async init(force = false) {
        if (!browser) return;
        if (initialized && !force) return;

        try {
            const me = await clientApi.getMe();
            user = me;
        } catch {
            user = null;
        } finally {
            initialized = true;
        }
    },

    async login(credentials: { login: string; password: string }) {
        await clientApi.login(credentials);
        await this.init(true);
    },

    async register(data: { username: string; email: string; password: string }) {
        await clientApi.register(data);
        await this.login({ login: data.email, password: data.password });
    },

    async loginWithGoogle(token: string) {
        await clientApi.googleAuth(token);
        await this.init(true);
    },

    async logout() {
        try {
            await clientApi.logout();
        } finally {
            user = null;
            if (browser) window.location.href = '/';
        }
    }
};
