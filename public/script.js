import CircularGallery from "./animation/gallery.js";

document.addEventListener("DOMContentLoaded", () => {
    // Ensure GA4 is loaded on every page (some pages don't have the head tag snippet)
    if (typeof gtag !== "function") {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-GQVHJLZL31";
        document.head.appendChild(gaScript);
        gtag("js", new Date());
        gtag("config", "G-GQVHJLZL31", { anonymize_ip: true });
    }
    // Active navigation state is now handled by js/header-loader.js
    // to support multi-page navigation correctly.

    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear().toString();
    }

    const liveRegion = document.createElement("div");
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);

    const toast = (() => {
        const el = document.createElement("div");
        el.className = "quickview-toast";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
        let timer;
        return {
            show(message) {
                window.clearTimeout(timer);
                el.textContent = message;
                el.classList.add("is-visible");
                timer = window.setTimeout(() => {
                    el.classList.remove("is-visible");
                }, 2400);
            },
        };
    })();

    const announce = (message) => {
        liveRegion.textContent = "";
        window.requestAnimationFrame(() => {
            liveRegion.textContent = message;
        });
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreferenceChange = (callback) => {
        if (typeof prefersReducedMotion.addEventListener === "function") {
            prefersReducedMotion.addEventListener("change", callback);
        } else if (typeof prefersReducedMotion.addListener === "function") {
            prefersReducedMotion.addListener(callback);
        }
    };

    const initHeroIntro = () => {
        const root = document.body;
        if (!root) return;
        let started = false;
        const begin = () => {
            if (started) return;
            started = true;
            root.classList.add("hero-bg-ready");
            const delay = 1000;
            window.setTimeout(() => {
                root.classList.remove("hero-intro-pending");
                root.classList.add("hero-intro-ready");
            }, delay);
        };

        if (!document.documentElement.classList.contains("i18n-loading")) {
            begin();
            return;
        }

        document.addEventListener("i18n:applied", begin, { once: true });
        const observer = new MutationObserver(() => {
            if (!document.documentElement.classList.contains("i18n-loading")) {
                observer.disconnect();
                begin();
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        window.setTimeout(() => {
            observer.disconnect();
            begin();
        }, 3500);
    };

    const initNavigation = () => {
        const navToggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");
        if (navToggle && navLinks) {
            const closeNav = () => {
                navToggle.setAttribute("aria-expanded", "false");
                navLinks.setAttribute("aria-expanded", "false");
            };
            navToggle.setAttribute("aria-expanded", "false");
            navLinks.setAttribute("aria-expanded", "false");

            // Remove existing listener if any (to prevent multiple listeners)
            const newNavToggle = navToggle.cloneNode(true);
            navToggle.parentNode.replaceChild(newNavToggle, navToggle);

            newNavToggle.addEventListener("click", () => {
                const expanded = newNavToggle.getAttribute("aria-expanded") === "true";
                const next = !expanded;
                newNavToggle.setAttribute("aria-expanded", String(next));
                navLinks.setAttribute("aria-expanded", String(next));
            });

            const collapseOnLink = () => {
                if (window.matchMedia("(max-width: 900px)").matches) {
                    closeNav();
                }
            };

            navLinks.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", collapseOnLink);
            });

            // Use event delegation for click outside to avoid multiple document listeners
            if (!window._navClickHandled) {
                document.addEventListener("click", (event) => {
                    const currentNavToggle = document.querySelector(".nav-toggle");
                    const currentNavLinks = document.querySelector(".nav-links");
                    if (!window.matchMedia("(max-width: 900px)").matches || !currentNavToggle || !currentNavLinks) return;
                    if (!currentNavLinks.contains(event.target) && !currentNavToggle.contains(event.target)) {
                        currentNavToggle.setAttribute("aria-expanded", "false");
                        currentNavLinks.setAttribute("aria-expanded", "false");
                    }
                });
                window._navClickHandled = true;
            }

            window.addEventListener("resize", () => {
                if (!window.matchMedia("(max-width: 900px)").matches) {
                    closeNav();
                }
            });

            document.addEventListener("keydown", (event) => {
                const currentNavToggle = document.querySelector(".nav-toggle");
                if (event.key === "Escape" && currentNavToggle && currentNavToggle.getAttribute("aria-expanded") === "true") {
                    currentNavToggle.setAttribute("aria-expanded", "false");
                    document.querySelector(".nav-links").setAttribute("aria-expanded", "false");
                    currentNavToggle.focus();
                }
            });
        }
    };

    initNavigation();
    window.addEventListener('headerLoaded', initNavigation);

    const initStickyHeader = () => {
        const stickyTarget = document.querySelector("[data-sticky]");
        if (stickyTarget) {
            const toggleSticky = () => {
                stickyTarget.classList.toggle("is-sticky", window.scrollY > 12);
            };
            toggleSticky();
            window.addEventListener("scroll", toggleSticky, { passive: true });
        }
    };

    initStickyHeader();
    window.addEventListener('headerLoaded', initStickyHeader);
    initHeroIntro();

    // ---- GA4 helper and key events ----
    const trackEvent = (action, params = {}) => {
        if (typeof gtag === "function") {
            gtag("event", action, params);
        }
    };

    // Hero CTAs
    const exploreMoreBtn = document.querySelector('.hero-actions .btn-primary[href^="#values"]');
    if (exploreMoreBtn) {
        exploreMoreBtn.addEventListener('click', () => {
            trackEvent('cta_click', {
                label: 'hero_explore_more',
                lang: document.documentElement.lang || 'en'
            });
        });
    }

    const franchiseBtn = document.querySelector('.hero-actions .btn-outline[href*="franchising"]');
    if (franchiseBtn) {
        franchiseBtn.addEventListener('click', () => {
            trackEvent('cta_click', {
                label: 'hero_franchise',
                lang: document.documentElement.lang || 'en'
            });
        });
    }

    // Navigation clicks
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => {
            trackEvent('nav_click', {
                item: link.textContent?.trim() || 'nav_link',
                destination: link.getAttribute('href') || '',
                page_path: window.location.pathname
            });
        });
    });

    // Section view tracking (fires once per section per load)
    const sectionIds = ['values', 'menu', 'community', 'faq', 'contact', 'franchise', 'benefits', 'investment', 'journey', 'options'];
    const seenSections = new Set();
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !seenSections.has(entry.target.id)) {
                    seenSections.add(entry.target.id);
                    trackEvent('section_view', {
                        section: entry.target.id,
                        page_path: window.location.pathname,
                        lang: document.documentElement.lang || 'en'
                    });
                    sectionObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.35 }
    );
    sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    // Scroll depth thresholds
    const depthMarks = [25, 50, 75, 100];
    const firedDepths = new Set();
    const onScrollDepth = () => {
        const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        depthMarks.forEach((mark) => {
            if (scrolled >= mark && !firedDepths.has(mark)) {
                firedDepths.add(mark);
                trackEvent('scroll_depth', {
                    percent: mark,
                    page_path: window.location.pathname,
                    lang: document.documentElement.lang || 'en'
                });
            }
        });
        if (firedDepths.size === depthMarks.length) {
            window.removeEventListener('scroll', onScrollDepth);
        }
    };
    window.addEventListener('scroll', onScrollDepth, { passive: true });

    // Engagement heartbeat every 20s while page visible
    let heartbeatTimer;
    const startHeartbeat = () => {
        heartbeatTimer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                trackEvent('engagement_tick', {
                    page_path: window.location.pathname,
                    lang: document.documentElement.lang || 'en'
                });
            }
        }, 20000);
    };
    const stopHeartbeat = () => heartbeatTimer && clearInterval(heartbeatTimer);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopHeartbeat();
        } else {
            stopHeartbeat();
            startHeartbeat();
        }
    });
    startHeartbeat();

    // Contact form lifecycle
    document.querySelectorAll('form[action*="contact"], #contact-form').forEach((form) => {
        form.addEventListener('focusin', () => {
            trackEvent('form_start', { form: form.id || 'contact', page_path: window.location.pathname });
        }, { once: true });
        form.addEventListener('submit', () => {
            trackEvent('form_submit', {
                form: form.id || 'contact',
                page_path: window.location.pathname
            });
        });
    });

    // Button clicks with labels
    document.querySelectorAll('[data-track]').forEach((el) => {
        el.addEventListener('click', () => {
            trackEvent('button_click', {
                label: el.dataset.label || el.textContent?.trim() || 'button',
                page_path: window.location.pathname
            });
        });
    });

    // Add-to-cart buttons (if present)
    document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
        btn.addEventListener('click', () => {
            trackEvent('add_to_cart', {
                item_id: btn.dataset.productId || btn.dataset.id || 'unknown',
                item_name: btn.dataset.productName || btn.dataset.name || 'unknown',
                price: Number(btn.dataset.productPrice || btn.dataset.price) || undefined,
                currency: 'MAD'
            });
        });
    });

    // Proceed to order / checkout buttons (cart / checkout pages)
    const proceedOrderBtn = document.querySelector('.cart-proceed-order-btn');
    if (proceedOrderBtn) {
        proceedOrderBtn.addEventListener('click', () => {
            trackEvent('proceed_to_order', { page_path: window.location.pathname });
        });
    }
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            trackEvent('begin_checkout', { page_path: window.location.pathname });
        });
    }

    // FAQ toggles
    document.querySelectorAll('.faq-item summary, .faq-item button').forEach((el) => {
        el.addEventListener('click', () => {
            trackEvent('faq_toggle', {
                question: el.textContent?.trim() || 'faq',
                page_path: window.location.pathname
            });
        });
    });

    // JS error logging (non-blocking)
    window.addEventListener('error', (e) => {
        trackEvent('error_js', {
            message: e.message || 'error',
            file: e.filename || '',
            line: e.lineno || 0
        });
    });
    window.addEventListener('unhandledrejection', (e) => {
        trackEvent('error_js', {
            message: (e.reason && e.reason.message) || 'promise_rejection',
            file: '',
            line: 0
        });
    });

    // Menu page filters (including new Healthy filter)
    const catalogFilters = document.querySelector('.catalog-filters');
    if (catalogFilters) {
        const filterButtons = Array.from(catalogFilters.querySelectorAll('.filter-btn'));
        const productCards = Array.from(document.querySelectorAll('.product-card'));

        const resolveCategories = (rawCategory) => {
            const raw = String(rawCategory || '').trim().toLowerCase();
            if (!raw) return [];

            const valid = ['vegetarian', 'gluten-free', 'low-carb', 'healthy', 'raw-materials'];
            const validSet = new Set(valid);
            const normalized = raw.replace(/[_\s]+/g, '-');
            const set = new Set();

            const tryExpandComposite = (part) => {
                if (part === 'gluten-vegetarian' || part === 'vegetarian-gluten') {
                    set.add('gluten-free');
                    set.add('vegetarian');
                    return true;
                }
                for (let i = 0; i < valid.length; i++) {
                    for (let j = i + 1; j < valid.length; j++) {
                        const a = valid[i];
                        const b = valid[j];
                        if (part === `${a}-${b}` || part === `${b}-${a}`) {
                            set.add(a);
                            set.add(b);
                            return true;
                        }
                    }
                }
                return false;
            };

            normalized
                .split(/[|,/]+/)
                .map((part) => part.trim())
                .filter(Boolean)
                .forEach((part) => {
                    if (validSet.has(part)) {
                        set.add(part);
                        return;
                    }
                    tryExpandComposite(part);
                });

            return Array.from(set);
        };

        const formatCategoryLabel = (value) => String(value || '').replace(/-/g, ' ');

        const applyBadgeLabel = (card, filter) => {
            const badge = card.querySelector('.product-badge');
            if (!badge) return;
            const inStock = !card.querySelector('[aria-disabled="true"]');
            if (!inStock) {
                badge.textContent = 'Sold Out';
                return;
            }
            const categories = resolveCategories(card.dataset.category);
            const label = filter === 'all'
                ? categories.map(formatCategoryLabel).join(', ')
                : formatCategoryLabel(filter);
            badge.textContent = label || formatCategoryLabel(card.dataset.category);
        };

        const applyFilter = (filter) => {
            filterButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === filter));
            productCards.forEach((card) => {
                const categories = resolveCategories(card.dataset.category);
                const match =
                    filter === 'all' ||
                    categories.includes(filter);
                card.style.display = match ? '' : 'none';
                applyBadgeLabel(card, filter);
            });
        };

        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
        });
    }


    const animated = document.querySelectorAll("[data-animate]");
    if (animated.length) {
        let observer;
        const initObserver = () =>
            new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.01, rootMargin: "0px 0px 200px 0px" }
            );

        const applyMotionPreference = () => {
            if (observer) {
                observer.disconnect();
                observer = undefined;
            }
            if (prefersReducedMotion.matches) {
                animated.forEach((el) => el.classList.add("is-visible"));
                return;
            }
            observer = initObserver();
            animated.forEach((el) => {
                el.classList.remove("is-visible");
                observer?.observe(el);
            });
        };

        applyMotionPreference();
        onMotionPreferenceChange(applyMotionPreference);

        // Re-check animations after translations are applied and loading class is removed
        document.addEventListener("i18n:applied", () => {
            if (observer) {
                animated.forEach((el) => {
                    if (!el.classList.contains("is-visible")) {
                        observer.unobserve(el);
                        observer.observe(el);
                    }
                });
            }
        });
    }

    const parseGap = (value) => {
        const numeric = Number.parseFloat(value);
        return Number.isNaN(numeric) ? 0 : numeric;
    };

    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
        const track = carousel.querySelector("[data-carousel-track]");
        if (!track) return;

        const items = Array.from(track.children);
        if (!items.length) return;

        const prevButton = carousel.querySelector("[data-carousel-button=\"prev\"]");
        const nextButton = carousel.querySelector("[data-carousel-button=\"next\"]");
        let currentIndex = 0;
        let visibleCount = 1;
        let autoTimer;

        const update = () => {
            const style = getComputedStyle(track);
            const gap = parseGap(style.columnGap || style.gap || "0");
            const itemWidth = items[0].getBoundingClientRect().width;
            if (itemWidth === 0) return;

            const containerWidth = track.parentElement?.getBoundingClientRect().width || track.getBoundingClientRect().width;
            visibleCount = Math.max(1, Math.round((containerWidth + gap) / (itemWidth + gap)));
            const maxIndex = Math.max(0, items.length - visibleCount);
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }

            const offset = currentIndex * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;

            if (prevButton) {
                prevButton.disabled = currentIndex === 0;
            }
            if (nextButton) {
                nextButton.disabled = currentIndex >= maxIndex;
            }
        };

        const goTo = (index) => {
            const maxIndex = Math.max(0, items.length - visibleCount);
            currentIndex = Math.min(Math.max(index, 0), maxIndex);
            update();
        };

        const stopAuto = () => {
            if (autoTimer) {
                window.clearInterval(autoTimer);
                autoTimer = undefined;
            }
        };

        const startAuto = () => {
            if (prefersReducedMotion.matches) return;
            const delay = Number(carousel.dataset.interval || 6000);
            if (!Number.isFinite(delay) || delay <= 0) return;
            if (items.length <= visibleCount) return;
            stopAuto();
            autoTimer = window.setInterval(() => {
                if (document.hidden) return;
                const maxIndex = Math.max(0, items.length - visibleCount);
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                update();
            }, delay);
        };

        const restartAuto = () => {
            stopAuto();
            startAuto();
        };

        prevButton?.addEventListener("click", () => {
            goTo(currentIndex - 1);
            restartAuto();
        });

        nextButton?.addEventListener("click", () => {
            goTo(currentIndex + 1);
            restartAuto();
        });

        carousel.addEventListener("mouseenter", stopAuto);
        carousel.addEventListener("mouseleave", startAuto);
        carousel.addEventListener("focusin", stopAuto);
        carousel.addEventListener("focusout", startAuto);

        window.addEventListener("resize", () => {
            update();
            startAuto();
        });

        const handleMotionChange = () => {
            if (prefersReducedMotion.matches) {
                stopAuto();
            } else {
                startAuto();
            }
        };

        onMotionPreferenceChange(handleMotionChange);

        update();
        startAuto();
    });

    document.querySelectorAll("[data-testimonial-marquee]").forEach((section) => {
        const track = section.querySelector("[data-testimonial-track]");
        if (!track) return;

        let cards = Array.from(track.children);
        if (cards.length < 2) return;

        const getGap = () => {
            const style = getComputedStyle(track);
            return parseGap(style.columnGap || style.gap || "0");
        };

        const baseSpeed = Number.parseFloat(section.dataset.speed || "36");
        const speed = Number.isFinite(baseSpeed) && baseSpeed > 0 ? baseSpeed : 36;

        let offset = 0;
        let rafId;
        let lastTimestamp;

        const reset = () => {
            offset = 0;
            track.style.transform = "translateX(0)";
            cards = Array.from(track.children);
        };

        const step = (timestamp) => {
            if (lastTimestamp === undefined) {
                lastTimestamp = timestamp;
            }
            const delta = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            const isRTL = document.documentElement.dir === 'rtl';

            offset += (speed * delta) / 1000;
            let gap = getGap();

            if (!isRTL) {
                // NORMAL LTR: Move Left
                let firstCard = cards[0];
                while (firstCard) {
                    const widthWithGap = firstCard.getBoundingClientRect().width + gap;
                    if (offset < widthWithGap) break;
                    offset -= widthWithGap;
                    track.appendChild(firstCard);
                    cards = Array.from(track.children);
                    firstCard = cards[0];
                    gap = getGap();
                }
                track.style.transform = `translateX(-${offset}px)`;
            } else {
                // RTL: Move Right
                // Recycle items from Right (first) to Left (last)
                let firstCard = cards[0];
                while (firstCard) {
                    const widthWithGap = firstCard.getBoundingClientRect().width + gap;
                    if (offset < widthWithGap) break;

                    offset -= widthWithGap;
                    track.appendChild(firstCard);

                    cards = Array.from(track.children);
                    firstCard = cards[0];
                    gap = getGap();
                }
                track.style.transform = `translateX(${offset}px)`;
            }

            rafId = window.requestAnimationFrame(step);
        };

        const stop = () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = undefined;
            }
            lastTimestamp = undefined;
        };

        const start = () => {
            if (prefersReducedMotion.matches || rafId) return;
            lastTimestamp = undefined;
            rafId = window.requestAnimationFrame(step);
        };

        const pause = () => {
            stop();
        };

        const resume = () => {
            if (!prefersReducedMotion.matches) {
                start();
            }
        };

        section.addEventListener("mouseenter", pause);
        section.addEventListener("mouseleave", resume);
        section.addEventListener("focusin", pause);
        section.addEventListener("focusout", resume);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stop();
            } else {
                resume();
            }
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                const wasRunning = Boolean(rafId);
                stop();
                reset();
                if (wasRunning && !prefersReducedMotion.matches) {
                    start();
                }
            }, 120);
        });

        const handleMotionChange = () => {
            if (prefersReducedMotion.matches) {
                stop();
                reset();
            } else {
                start();
            }
        };

        onMotionPreferenceChange(handleMotionChange);

        // Reset on language change to recalculate widths
        document.addEventListener("i18n:applied", () => {
            window.clearTimeout(resizeTimer);
            // Small delay to ensure DOM updates are rendered and new widths calculate correctly
            resizeTimer = window.setTimeout(() => {
                const wasRunning = Boolean(rafId);
                stop();
                reset();
                if (wasRunning && !prefersReducedMotion.matches) {
                    start();
                }
            }, 100);
        });

        reset();
        start();
    });

    // Cart Management - handled by CartManager class (loaded from js/cart-manager.js)
    // Initialize CartManager
    if (typeof CartManager !== 'undefined') {
        window.cartManager = new CartManager();
    }

    // Quick view functionality handled by modal.js

    // Initialize circular gallery (desktop only)
    const galleryRoots = document.querySelectorAll("[data-circular-gallery]");
    let galleryInstances = [];
    if (galleryRoots.length) {
        const galleryQuery = window.matchMedia("(max-width: 768px)");
        let resizeTimer;

        const updateGalleries = () => {
            const isMobile = galleryQuery.matches;
            if (isMobile) {
                galleryInstances.forEach((instance) => instance.destroy());
                galleryInstances = [];
                return;
            }
            if (galleryInstances.length) return;
            galleryRoots.forEach((root) => {
                galleryInstances.push(new CircularGallery(root, { prefersReducedMotion }));
            });
        };

        const handleResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(updateGalleries, 150);
        };

        if (typeof galleryQuery.addEventListener === "function") {
            galleryQuery.addEventListener("change", updateGalleries);
        } else if (typeof galleryQuery.addListener === "function") {
            galleryQuery.addListener(updateGalleries);
        }
        window.addEventListener("resize", handleResize, { passive: true });

        updateGalleries();
    }
});
