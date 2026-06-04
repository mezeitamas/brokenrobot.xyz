import { useEffect, useState } from 'preact/hooks';

type Theme = 'light' | 'dark';

function readTheme(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function SunIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="4.2"
            />
            <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" />
        </svg>
    );
}

function ThemeToggle() {
    // Start from the server-stable default so SSR and first client render match,
    // then sync to the real theme (set pre-paint by the inline script) after mount.
    const [theme, setTheme] = useState<Theme>('light');
    const isDark = theme === 'dark';

    useEffect(() => {
        setTheme(readTheme());
    }, []);

    const toggle = (): void => {
        const next: Theme = isDark ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;

        try {
            localStorage.setItem('theme', next);
        } catch {
            // Ignore storage failures (e.g. private mode); theme still applies for this session.
        }

        setTheme(next);
    };

    return (
        <button
            type="button"
            class="border-border bg-surface text-text hover:border-accent inline-grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border transition-colors"
            onClick={toggle}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title="Toggle light / dark"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

export { ThemeToggle };
