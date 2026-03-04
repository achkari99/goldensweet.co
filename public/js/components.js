/**
 * Shared Components Loader
 * Loads header and footer components into pages
 */

const Components = (() => {
    /**
     * Get base path for components based on current page
     */
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../';
        }
        return './';
    }

    /**
     * Load and inject header component
     */
    async function loadHeader(targetSelector = '#header-placeholder') {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        try {
            const basePath = getBasePath();
            const response = await fetch(`${basePath}components/header.html`);
            if (!response.ok) throw new Error('Failed to load header');

            let html = await response.text();
            // Adjust paths for pages subdirectory
            if (window.location.pathname.includes('/pages/')) {
                html = html.replace(/href="index\.html/g, 'href="../index.html');
                html.replace(/href="pages\//g, 'href="');
                html = html.replace(/src="images\//g, 'src="../images/');
                html = html.replace(/src="assets\//g, 'src="../assets/');
            }
            target.outerHTML = html;

            // Set active nav state
            setActiveNav();
        } catch (error) {
            console.error('Components: Failed to load header:', error);
        }
    }

    /**
     * Load and inject footer component
     */
    async function loadFooter(targetSelector = '#footer-placeholder') {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        try {
            const basePath = getBasePath();
            const response = await fetch(`${basePath}components/footer.html`);
            if (!response.ok) throw new Error('Failed to load footer');

            let html = await response.text();
            // Adjust paths for pages subdirectory
            if (window.location.pathname.includes('/pages/')) {
                html = html.replace(/href="index\.html/g, 'href="../index.html');
                html = html.replace(/href="pages\//g, 'href="');
            }
            target.outerHTML = html;

            // Update current year
            const yearEl = document.getElementById('current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        } catch (error) {
            console.error('Components: Failed to load footer:', error);
        }
    }

    /**
     * Set active navigation state based on current page
     */
    function setActiveNav() {
        const path = window.location.pathname;
        const currentPage = path.split('/').pop().replace('.html', '') || 'index';

        document.querySelectorAll('[data-page]').forEach(link => {
            const page = link.getAttribute('data-page');
            const isActive =
                (currentPage === 'index' && page === 'home') ||
                path.includes(page);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Initialize all components
     */
    async function init() {
        await Promise.all([
            loadHeader(),
            loadFooter()
        ]);
    }

    return {
        init,
        loadHeader,
        loadFooter,
        setActiveNav
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Components.init());
} else {
    Components.init();
}

export default Components;
