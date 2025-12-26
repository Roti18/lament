/**
 * Theme Store - Manages dark/light theme with localStorage persistence
 */

type Theme = 'dark' | 'light';

class ThemeStore {
    current = $state<Theme>('dark');

    constructor() {
        // Initialize on client side only
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        // Check localStorage first
        const stored = localStorage.getItem('lament-theme') as Theme | null;
        if (stored && (stored === 'dark' || stored === 'light')) {
            this.current = stored;
        } else {
            // Fall back to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.current = prefersDark ? 'dark' : 'light';
        }
        this.apply();

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('lament-theme')) {
                this.current = e.matches ? 'dark' : 'light';
                this.apply();
            }
        });
    }

    private apply() {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', this.current);
        }
    }

    toggle() {
        this.current = this.current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('lament-theme', this.current);
        this.apply();
    }

    set(theme: Theme) {
        this.current = theme;
        localStorage.setItem('lament-theme', this.current);
        this.apply();
    }
}

export const theme = new ThemeStore();
