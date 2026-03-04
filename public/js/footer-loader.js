// Footer Component Loader
(function () {
    // Use absolute path for footer component
    const footerPath = '/components/footer.html';

    // Load footer component
    fetch(footerPath, { cache: 'no-cache' })
        .then(response => response.text())
        .then(html => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.outerHTML = html;

                // Set current year
                const yearElement = document.getElementById('current-year');
                if (yearElement) {
                    yearElement.textContent = new Date().getFullYear();
                }

                // Highlight active link logic
                const currentPath = window.location.pathname;
                const normalizePath = (path) => {
                    return path.replace(/\/$/, '').replace(/\.html$/, '').replace(/^\//, '');
                };
                const normalizedCurrent = normalizePath(currentPath);

                document.querySelectorAll('.site-footer a').forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (!linkHref || linkHref.startsWith('http') || linkHref.startsWith('mailto') || linkHref.startsWith('tel')) return;

                    const normalizedLink = normalizePath(linkHref);
                    let isActive = false;

                    if (normalizedCurrent === '' || normalizedCurrent === 'index') {
                        isActive = (normalizedLink === 'index' || normalizedLink === '');
                    } else {
                        isActive = normalizedCurrent.endsWith(normalizedLink.split('/').pop());
                    }

                    if (isActive) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    }
                });

                console.log('[FooterLoader] Footer loaded and active links highlighted');
                // I18n MutationObserver will handle translation automatically
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})();
