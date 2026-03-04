/**
 * Interactive Flipbook Catalog - JavaScript Implementation
 * Powered by StPageFlip.js
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        width: 550,
        height: 733,
        minWidth: 315,
        maxWidth: 550,
        minHeight: 420,
        maxHeight: 733,
        showCover: true,
        mobileScrollSupport: false,
        swipeDistance: 30,
        flippingTime: 1300,
        usePortrait: true,
        startPage: 0,
        size: 'stretch',
        drawShadow: true,
        maxShadowOpacity: 0.3,
        showPageCorners: true,
        disableFlipByClick: false
    };

    /**
     * Insert a filler page if we have an odd number of pages
     * This ensures the book always has an even number of pages
     */
    function insertFillerPageIfNeeded(bookElement) {
        const pages = bookElement.querySelectorAll('.page');
        if (pages.length % 2 === 0) {
            return;
        }

        const filler = document.createElement('div');
        filler.className = 'page page--filler';
        filler.dataset.density = 'soft';
        filler.setAttribute('aria-hidden', 'true');
        filler.innerHTML = '<div class="page-content"></div>';

        const lastPage = pages[pages.length - 1];
        lastPage.parentElement.insertBefore(filler, lastPage);
    }

    /**
     * Force soft covers on the first and last pages
     * This makes the covers look more natural and realistic
     */
    function forceSoftCovers(pageFlip) {
        const collection = pageFlip.getPageCollection();
        if (!collection) {
            return;
        }

        const total = collection.getPageCount();
        if (total === 0) {
            return;
        }

        const first = collection.getPage(0);
        if (first && typeof first.setDensity === 'function') {
            first.setDensity('soft');
            if (typeof first.setDrawingDensity === 'function') {
                first.setDrawingDensity('soft');
            }
            const el = typeof first.getElement === 'function' ? first.getElement() : first.element;
            if (el) {
                el.dataset.density = 'soft';
            }
        }

        if (total > 1) {
            const last = collection.getPage(total - 1);
            if (last && typeof last.setDensity === 'function') {
                last.setDensity('soft');
                if (typeof last.setDrawingDensity === 'function') {
                    last.setDrawingDensity('soft');
                }
                const el = typeof last.getElement === 'function' ? last.getElement() : last.element;
                if (el) {
                    el.dataset.density = 'soft';
                }
            }
        }
    }

    function initFlipbook() {
        const container = document.getElementById('flipbook-container');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageIndicator = document.getElementById('page-indicator');

        if (!container) {
            console.error('Flipbook container not found');
            return;
        }

        insertFillerPageIfNeeded(container);

        const containerWidth = container.offsetWidth;
        const isMobile = window.innerWidth < 768;
        const pageWidth = isMobile
            ? Math.min(containerWidth * 0.9, CONFIG.maxWidth)
            : Math.min(containerWidth / 2.2, CONFIG.maxWidth);
        const pageHeight = (pageWidth * 4) / 3;

        const pageFlip = new St.PageFlip(container, {
            width: pageWidth,
            height: pageHeight,
            minWidth: CONFIG.minWidth,
            maxWidth: CONFIG.maxWidth,
            minHeight: CONFIG.minHeight,
            maxHeight: CONFIG.maxHeight,
            size: CONFIG.size,
            showCover: CONFIG.showCover,
            mobileScrollSupport: CONFIG.mobileScrollSupport,
            swipeDistance: CONFIG.swipeDistance,
            flippingTime: CONFIG.flippingTime,
            usePortrait: CONFIG.usePortrait,
            startPage: CONFIG.startPage,
            drawShadow: CONFIG.drawShadow,
            maxShadowOpacity: CONFIG.maxShadowOpacity,
            showPageCorners: CONFIG.showPageCorners,
            disableFlipByClick: CONFIG.disableFlipByClick
        });

        const pages = document.querySelectorAll('.page');
        if (pages.length === 0) {
            console.error('No pages found for flipbook');
            return;
        }

        pageFlip.loadFromHTML(pages);

        pageFlip.on('init', () => forceSoftCovers(pageFlip));
        pageFlip.on('update', () => forceSoftCovers(pageFlip));
        pageFlip.on('changeOrientation', () => forceSoftCovers(pageFlip));

        forceSoftCovers(pageFlip);

        function updatePageIndicator() {
            const currentPage = pageFlip.getCurrentPageIndex();
            const totalPages = pageFlip.getPageCount();

            if (pageIndicator) {
                pageIndicator.textContent = `Page ${currentPage + 1} / ${totalPages}`;
            }

            if (prevBtn) {
                prevBtn.disabled = currentPage === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentPage >= totalPages - 1;
            }
        }

        pageFlip.on('changeState', (event) => {
            const state = typeof event === 'string'
                ? event
                : typeof event?.data === 'string'
                    ? event.data
                    : '';
            container.dataset.flipState = state;
        });

        pageFlip.on('flip', (e) => {
            updatePageIndicator();

            if (typeof e?.data === 'number') {
                document.documentElement.style.setProperty('--current-page', String(e.data));
            }

            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });

        pageFlip.on('changeOrientation', (e) => {
            console.log('Orientation changed:', e.data);
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                pageFlip.flipPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                pageFlip.flipNext();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                pageFlip.flipPrev();
            } else if (e.key === 'ArrowRight') {
                pageFlip.flipNext();
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newContainerWidth = container.offsetWidth;
                const newIsMobile = window.innerWidth < 768;
                const newPageWidth = newIsMobile
                    ? Math.min(newContainerWidth * 0.9, CONFIG.maxWidth)
                    : Math.min(newContainerWidth / 2.2, CONFIG.maxWidth);
                const newPageHeight = (newPageWidth * 4) / 3;

                pageFlip.updateState({
                    width: newPageWidth,
                    height: newPageHeight
                });
            }, 250);
        });

        updatePageIndicator();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(container);

        console.log('Flipbook initialized successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFlipbook);
    } else {
        initFlipbook();
    }
})();
