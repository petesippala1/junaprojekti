(() => {
    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('junaseuranta-theme');
    } catch {
        // Teeman vaihto toimii myös silloin, kun selain estää tallennuksen.
    }
    if (savedTheme !== 'light' && savedTheme !== 'dark') savedTheme = null;

    function applyTheme(theme) {
        root.dataset.theme = theme;
        document.querySelector('#theme-toggle')?.setAttribute('aria-pressed', String(theme === 'dark'));
    }

    applyTheme(savedTheme || (preference.matches ? 'dark' : 'light'));
    preference.addEventListener('change', event => {
        if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light');
    });

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.querySelector('#theme-toggle');
        applyTheme(root.dataset.theme);
        toggle.addEventListener('click', () => {
            savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(savedTheme);
            try {
                localStorage.setItem('junaseuranta-theme', savedTheme);
            } catch {
                // Valittu teema pysyy käytössä tämän sivun ajan.
            }
        });
    });
})();
