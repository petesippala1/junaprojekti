
(() => {
    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-color-scheme: dark)');

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem('junaseuranta-theme');
    } catch {
        // Teeman vaihto toimii myös silloin, kun selain estää tallennuksen.
    }

    if (savedTheme !== 'light' && savedTheme !== 'dark') {
        savedTheme = null;
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;

        const toggle = document.querySelector('#theme-toggle');
        const isDark = theme === 'dark';

        if (toggle) {
            toggle.textContent = isDark ? 'Vaalea tila' : 'Tumma tila';

            toggle.setAttribute(
                'aria-pressed',
                String(isDark)
            );
        }
    }

    applyTheme(savedTheme || (preference.matches ? 'dark' : 'light'));

    preference.addEventListener('change', event => {
        if (!savedTheme) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.querySelector('#theme-toggle');

        if (!toggle) {
            return;
        }

        applyTheme(root.dataset.theme);

        toggle.addEventListener('click', () => {
            savedTheme = root.dataset.theme === 'dark'
                ? 'light'
                : 'dark';

            applyTheme(savedTheme);

            try {
                localStorage.setItem('junaseuranta-theme', savedTheme);
            } catch {
                // Valittu teema pysyy käytössä tämän sivun ajan.
            }
        });
    });
})();
