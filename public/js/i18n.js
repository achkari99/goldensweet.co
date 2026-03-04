/**
 * Cinnamona i18n - Lightweight Internationalization Module
 * Supports EN (English) and AR (Arabic with RTL)
 */

const I18n = (() => {
    // Configuration
    const SUPPORTED_LANGS = ['en', 'ar'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'cinnamona-lang';

    // State
    let currentLang = DEFAULT_LANG;
    let translations = {};
    let isLoaded = false;

    /**
     * Detect user's preferred language
     */
    function detectLanguage() {
        // Check localStorage first
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGS.includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }

        return DEFAULT_LANG;
    }

    /**
     * Load translations from JSON file
     */
    async function loadTranslations(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language "${lang}" not supported, falling back to "${DEFAULT_LANG}"`);
            lang = DEFAULT_LANG;
        }

        try {
            // Use absolute path to ensure correct loading from any subdirectory
            const response = await fetch(`/locales/${lang}.json`, { cache: 'no-cache' });

            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }

            translations = await response.json();
            currentLang = lang;
            isLoaded = true;

            return translations;
        } catch (error) {
            console.error('i18n: Error loading translations:', error);

            // Fallback to default language if not already trying it
            if (lang !== DEFAULT_LANG) {
                return loadTranslations(DEFAULT_LANG);
            }

            return null;
        }
    }

    /**
     * Get a translation by key path (e.g., "nav.home")
     */
    function t(keyPath, fallback = '') {
        if (!isLoaded) {
            console.warn('i18n: Translations not loaded yet');
            return fallback || keyPath;
        }

        const keys = keyPath.split('.');
        let value = translations;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                console.warn(`i18n: Missing translation for "${keyPath}"`);
                return fallback || keyPath;
            }
        }

        return value;
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    function applyTranslations(emitEvent = true) {
        if (!isLoaded) return;

        // Update document metadata
        document.documentElement.lang = translations.meta?.lang || currentLang;
        document.documentElement.dir = translations.meta?.dir || (currentLang === 'ar' ? 'rtl' : 'ltr');

        // ... existing logic ...

        // Remove loading class (fixes FOUC)
        document.documentElement.classList.remove('i18n-loading');

        // Dispatch event for custom handlers
        if (emitEvent) {
            document.dispatchEvent(new CustomEvent('i18n:applied', {
                detail: { lang: currentLang, translations }
            }));
        }

        // Ensure language selectors are in sync
        // updateLanguageSelector(currentLang); // Will be called at end


        // Update title if available
        if (translations.meta?.title) {
            document.title = translations.meta.title;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translations.meta?.description) {
            metaDesc.setAttribute('content', translations.meta.description);
        }

        // Apply to all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const typingRoot = el.closest('[data-i18n-typing]');
            if (typingRoot && typingRoot.hasAttribute('data-typing-initialized')) return;
            const key = el.getAttribute('data-i18n');

            // Store original content as fallback on first run
            if (!el.hasAttribute('data-i18n-fallback')) {
                const originalContent = el.textContent.trim();
                if (originalContent) {
                    el.setAttribute('data-i18n-fallback', originalContent);
                }
            }

            const translation = t(key);
            const fallback = el.getAttribute('data-i18n-fallback');

            // Priority: translation > fallback > key
            const finalText = (translation && translation !== key) ? translation : (fallback || key);

            // Check if it's an input placeholder
            if (el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', finalText);
            }
            // Check if it's for aria-label
            else if (el.hasAttribute('data-i18n-aria')) {
                el.setAttribute('aria-label', finalText);
            }
            // Default: set text content
            else {
                el.textContent = finalText;
            }
        });

        // Apply to elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');

            // Store original placeholder as fallback
            if (!el.hasAttribute('data-i18n-placeholder-fallback')) {
                const originalPlaceholder = el.getAttribute('placeholder');
                if (originalPlaceholder) {
                    el.setAttribute('data-i18n-placeholder-fallback', originalPlaceholder);
                }
            }

            const translation = t(key);
            const fallback = el.getAttribute('data-i18n-placeholder-fallback');
            const finalText = (translation && translation !== key) ? translation : (fallback || key);

            el.setAttribute('placeholder', finalText);
        });

        // Apply to elements with data-i18n-aria
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');

            // Store original aria-label as fallback
            if (!el.hasAttribute('data-i18n-aria-fallback')) {
                const originalAria = el.getAttribute('aria-label');
                if (originalAria) {
                    el.setAttribute('data-i18n-aria-fallback', originalAria);
                }
            }

            const translation = t(key);
            const fallback = el.getAttribute('data-i18n-aria-fallback');
            const finalText = (translation && translation !== key) ? translation : (fallback || key);

            el.setAttribute('aria-label', finalText);
        });

        // Apply to elements with data-i18n-alt (images)
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');

            // Store original alt as fallback
            if (!el.hasAttribute('data-i18n-alt-fallback')) {
                const originalAlt = el.getAttribute('alt');
                if (originalAlt) {
                    el.setAttribute('data-i18n-alt-fallback', originalAlt);
                }
            }

            const translation = t(key);
            const fallback = el.getAttribute('data-i18n-alt-fallback');
            const finalText = (translation && translation !== key) ? translation : (fallback || key);

            el.setAttribute('alt', finalText);
        });

        // Apply to elements with data-i18n-typing (typing animation)
        document.querySelectorAll('[data-i18n-typing]').forEach(el => {
            const key = el.getAttribute('data-i18n-typing');
            const translation = t(key);
            if (translation && Array.isArray(translation)) {
                el.setAttribute('data-typing-words', JSON.stringify(translation));
                window.dispatchEvent(new CustomEvent('typing-update', { detail: { words: translation } }));
            }
        });

        // Keep product action labels aligned with the visible translated product name.
        document.querySelectorAll('[data-product]').forEach((card) => {
            const nameEl = card.querySelector('h3[data-i18n], h3');
            if (!nameEl) return;
            const displayName = nameEl.textContent.trim();
            if (!displayName) return;

            const addBtn = card.querySelector('[data-add-to-cart]');
            if (addBtn) {
                addBtn.setAttribute('data-add-to-cart', displayName);
            }

            const quickBtn = card.querySelector('[data-quickview]');
            if (quickBtn) {
                quickBtn.setAttribute('data-quickview', displayName);
            }
        });

        updateLanguageSelector(currentLang);
    }

    /**
     * Switch to a different language
     */
    async function switchLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language "${lang}" not supported`);
            return false;
        }

        if (lang === currentLang && isLoaded) {
            updateLanguageSelector(lang); // Ensure UI matches state
            return true; // Already on this language
        }

        const success = await loadTranslations(lang);

        if (success) {
            localStorage.setItem(STORAGE_KEY, lang);
            applyTranslations();
            // updateLanguageSelector is now called within applyTranslations
            return true;
        }

        return false;
    }

    /**
     * Update language selector UI
     */
    function updateLanguageSelector(lang) {
        document.querySelectorAll('[data-lang-switch]').forEach(el => {
            const btnLang = el.getAttribute('data-lang-switch');

            if (btnLang === lang) {
                el.classList.add('active');
                el.setAttribute('aria-current', 'true');
            } else {
                el.classList.remove('active');
                el.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Initialize global event listeners (Event Delegation)
     */
    function setupGlobalListeners() {
        // Use event delegation for language switching
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-lang-switch]');
            if (btn) {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang-switch');
                switchLanguage(lang);
            }
        });
    }

    /**
     * Setup MutationObserver to handle dynamic content automatically
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if added nodes contain translatable elements
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.hasAttribute('data-i18n') ||
                                node.querySelector('[data-i18n]') ||
                                node.querySelector('[data-lang-switch]')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });

            if (shouldUpdate && isLoaded) {
                // Debounce slighty to avoid thrashing if many nodes added at once
                if (window._i18nDebounce) clearTimeout(window._i18nDebounce);
                window._i18nDebounce = setTimeout(() => {
                    applyTranslations(false); // Re-apply but DON'T trigger global event to avoid loops
                }, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('i18n: MutationObserver active');
    }

    /**
     * Initialize i18n system
     */
    async function init() {
        setupGlobalListeners(); // Set up event delegation
        setupObserver(); // Start watching for dynamic content

        const lang = detectLanguage();
        await loadTranslations(lang);
        applyTranslations(); // Initial translation

        console.log(`i18n: Initialized with "${currentLang}" language`);
    }

    // Public API
    return {
        init,
        t,
        switchLanguage,
        applyTranslations,
        get currentLang() { return currentLang; },
        get isLoaded() { return isLoaded; },
        SUPPORTED_LANGS
    };
})();

// Expose to window for global access
window.I18n = I18n;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}


