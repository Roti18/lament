type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lament-theme';

class ThemeStore {
    current = $state<Theme>('dark');

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init(): void {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
            this.current = stored;
        } else {
            this.current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.apply();

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                this.current = e.matches ? 'dark' : 'light';
                this.apply();
            }
        });
    }

    private apply(): void {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', this.current);
        }
    }

    toggle(): void {
        this.current = this.current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, this.current);
        this.apply();
    }

    set(newTheme: Theme): void {
        this.current = newTheme;
        localStorage.setItem(STORAGE_KEY, this.current);
        this.apply();
    }
}

export const theme = new ThemeStore();
