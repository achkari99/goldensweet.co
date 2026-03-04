// Header Component Loader
(function () {
    // Use absolute path for header component
    const headerPath = '/components/header.html';

    // Load header component
    fetch(headerPath, { cache: 'no-cache' })
        .then(response => response.text())
        .then(html => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.outerHTML = html;

                // Highlight active link logic
                const currentPath = window.location.pathname;

                // Helper to normalize paths for comparison
                const normalizePath = (path) => {
                    // Remove trailing slash, .html extension, and leading slash
                    return path.replace(/\/$/, '').replace(/\.html$/, '').replace(/^\//, '');
                };

                const normalizedCurrent = normalizePath(currentPath);

                document.querySelectorAll('.nav-links a').forEach(link => {
                    const linkHref = link.getAttribute('href');
                    const normalizedLink = normalizePath(linkHref);

                    // Robust comparison logic
                    let isActive = false;

                    if (normalizedCurrent === '' || normalizedCurrent === 'index') {
                        // Home page case
                        isActive = (normalizedLink === 'index' || normalizedLink === '');
                    } else {
                        // Other pages: check if the link ends with the current page name
                        // This handles /pages/contact vs /contact scenarios
                        isActive = normalizedCurrent.endsWith(normalizedLink.split('/').pop());
                    }

                    if (isActive) {
                        link.setAttribute('aria-current', 'page');
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    }
                });

                // Dispatch headerLoaded event for cart manager and i18n
                window.dispatchEvent(new Event('headerLoaded'));
                console.log('[HeaderLoader] Header loaded, event dispatched');

                // Reinitialize cart count after header loads
                if (typeof updateCartBadge === 'function') {
                    updateCartBadge();
                }

                // Note: If I18n is not ready, it will apply translations itself when it loads
                // listening to the 'headerLoaded' event in i18n.js is the backup safety
            }
        })
})();
