// Client-side behavior for the theme toggle button. Imported by ThemeToggle.astro and
// bundled by Astro (loaded from `self`, CSP-safe). The correct icon is chosen by CSS from
// `html[data-theme]`, so this script only handles the click — no rendering, no flash.

const button = document.getElementById('theme-toggle');

const currentTheme = (): 'light' | 'dark' => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

if (button !== null) {
    const syncPressed = (): void => {
        button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
    };

    syncPressed();

    button.addEventListener('click', () => {
        const next: 'light' | 'dark' = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;

        try {
            localStorage.setItem('theme', next);
        } catch {
            // Ignore storage failures (e.g. private mode); theme still applies for this session.
        }

        syncPressed();
    });
}
