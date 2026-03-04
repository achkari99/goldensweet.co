/**
 * DARK-MODE.JS - Theme toggle functionality
 */

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.setTheme(this.theme);

        // Create toggle button
        this.createToggle();

        // Listen for system preference changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (!localStorage.getItem('theme')) {
            this.setTheme(darkModeQuery.matches ? 'dark' : 'light');
        }

        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.innerHTML = `
            <span class="icon-sun" aria-hidden="true">☀️</span>
            <span class="icon-moon" aria-hidden="true">🌙</span>
        `;

        toggle.addEventListener('click', () => this.toggle());
        document.body.appendChild(toggle);
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.ThemeManager = new ThemeManager();
});
