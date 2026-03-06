/**
 * Cinnamona i18n runtime - API-backed, fail-closed, no-cache content loading.
 */

const I18n = (() => {
  const SUPPORTED_LANGS = ['en', 'ar'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'cinnamona-lang';

  const PAGE_ID_BY_PATH = {
    '/': 'home',
    '/index.html': 'home',
    '/pages/menu.html': 'menu',
    '/pages/contact.html': 'contact',
    '/pages/faq.html': 'faq',
    '/pages/franchising.html': 'franchising',
    '/pages/la-maison.html': 'la-maison',
    '/pages/le-laboratoire.html': 'le-laboratoire',
    '/pages/nos-services.html': 'nos-services',
    '/pages/panier.html': 'panier',
    '/pages/presse.html': 'presse',
    '/pages/privacy-policy.html': 'privacy-policy',
    '/pages/refund-policy.html': 'refund-policy',
    '/pages/terms-of-use.html': 'terms-of-use',
  };

  let currentLang = DEFAULT_LANG;
  let translations = {};
  let isLoaded = false;

  function ensureFailClosedStyles() {
    if (document.getElementById('i18n-fail-closed-style')) return;

    const style = document.createElement('style');
    style.id = 'i18n-fail-closed-style';
    style.textContent = `
      html.i18n-loading body {
        opacity: 0;
        pointer-events: none;
      }
      html.i18n-loaded body,
      html.i18n-failed body {
        opacity: 1;
        pointer-events: auto;
        transition: opacity .15s ease;
      }
      .i18n-fail-screen {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 12px;
        background: #f5f0e4;
        color: #1b1b1b;
        z-index: 2147483647;
        text-align: center;
        padding: 24px;
      }
      .i18n-fail-screen button {
        border: 1px solid #1b1b1b;
        background: #ffffff;
        color: #1b1b1b;
        padding: 10px 16px;
        border-radius: 10px;
        cursor: pointer;
      }
      html.i18n-failed .i18n-fail-screen {
        display: flex;
      }
      html.i18n-failed body > *:not(.i18n-fail-screen) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureFailScreen() {
    let screen = document.querySelector('.i18n-fail-screen');
    if (screen) return screen;

    screen = document.createElement('div');
    screen.className = 'i18n-fail-screen';
    screen.innerHTML = `
      <h1>Content unavailable</h1>
      <p id="i18n-fail-message">We could not load website content from the server.</p>
      <button type="button" id="i18n-retry-btn">Retry</button>
    `;
    document.body.appendChild(screen);

    const retryBtn = screen.querySelector('#i18n-retry-btn');
    retryBtn.addEventListener('click', async () => {
      await init();
    });

    return screen;
  }

  function setLoadingState() {
    document.documentElement.classList.add('i18n-loading');
    document.documentElement.classList.remove('i18n-loaded', 'i18n-failed');
  }

  function setLoadedState() {
    document.documentElement.classList.remove('i18n-loading', 'i18n-failed');
    document.documentElement.classList.add('i18n-loaded');
  }

  function setFailedState(message) {
    const screen = ensureFailScreen();
    const msgEl = screen.querySelector('#i18n-fail-message');
    if (msgEl && message) {
      msgEl.textContent = message;
    }
    document.documentElement.classList.remove('i18n-loading', 'i18n-loaded');
    document.documentElement.classList.add('i18n-failed');
  }

  function detectLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }

    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
      return browserLang;
    }

    return DEFAULT_LANG;
  }

  function normalizePathname(pathname) {
    const noQuery = String(pathname || '/').split('?')[0].split('#')[0];
    return noQuery.endsWith('/') && noQuery !== '/' ? noQuery.slice(0, -1) : noQuery;
  }

  function resolvePageId() {
    const pathname = normalizePathname(window.location.pathname || '/');
    if (PAGE_ID_BY_PATH[pathname]) {
      return PAGE_ID_BY_PATH[pathname];
    }

    if (pathname.startsWith('/pages/')) {
      const leaf = pathname.split('/').pop() || '';
      if (leaf.endsWith('.html')) {
        return leaf.replace(/\.html$/, '');
      }
    }

    return 'home';
  }

  function deepMerge(target, source) {
    const out = { ...target };

    Object.keys(source || {}).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = out[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        out[key] = deepMerge(targetValue, sourceValue);
      } else {
        out[key] = sourceValue;
      }
    });

    return out;
  }

  async function fetchContent(path) {
    const response = await fetch(path, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${path}`);
    }

    const payload = await response.json();
    if (!payload || payload.success !== true || typeof payload.data !== 'object') {
      throw new Error(`Invalid content payload for ${path}`);
    }

    return payload.data;
  }

  async function loadTranslations(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      throw new Error(`Language "${lang}" not supported`);
    }

    const page = resolvePageId();

    const [commonData, pageData] = await Promise.all([
      fetchContent(`/api/content/common?lang=${encodeURIComponent(lang)}`),
      fetchContent(`/api/content/page/${encodeURIComponent(page)}?lang=${encodeURIComponent(lang)}`),
    ]);

    translations = deepMerge(commonData, pageData);
    currentLang = lang;
    isLoaded = true;
    return translations;
  }

  function t(keyPath, fallback = '') {
    if (!isLoaded) {
      return fallback;
    }

    const keys = String(keyPath || '').split('.');
    let value = translations;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }

    return value;
  }

  function applyTranslations(emitEvent = true) {
    if (!isLoaded) return;

    document.documentElement.lang = translations.meta?.lang || currentLang;
    document.documentElement.dir = translations.meta?.dir || (currentLang === 'ar' ? 'rtl' : 'ltr');

    if (translations.meta?.title) {
      document.title = translations.meta.title;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && translations.meta?.description) {
      metaDesc.setAttribute('content', String(translations.meta.description));
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const typingRoot = el.closest('[data-i18n-typing]');
      if (typingRoot && typingRoot.hasAttribute('data-typing-initialized')) return;

      const key = el.getAttribute('data-i18n');
      const translated = t(key, '');
      const finalText = typeof translated === 'string' ? translated : '';

      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', finalText);
      } else if (el.hasAttribute('data-i18n-aria')) {
        el.setAttribute('aria-label', finalText);
      } else {
        el.textContent = finalText;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = t(key, '');
      el.setAttribute('placeholder', typeof translated === 'string' ? translated : '');
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const translated = t(key, '');
      el.setAttribute('aria-label', typeof translated === 'string' ? translated : '');
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      const translated = t(key, '');
      el.setAttribute('alt', typeof translated === 'string' ? translated : '');
    });

    document.querySelectorAll('[data-i18n-typing]').forEach((el) => {
      const key = el.getAttribute('data-i18n-typing');
      const translated = t(key, null);
      if (Array.isArray(translated)) {
        el.setAttribute('data-typing-words', JSON.stringify(translated));
        window.dispatchEvent(new CustomEvent('typing-update', { detail: { words: translated } }));
      }
    });

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

    if (emitEvent) {
      document.dispatchEvent(new CustomEvent('i18n:applied', {
        detail: { lang: currentLang, translations },
      }));
    }
  }

  async function switchLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      return false;
    }

    setLoadingState();

    try {
      await loadTranslations(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
      setLoadedState();
      return true;
    } catch (err) {
      console.error('i18n switch failure:', err);
      setFailedState('We could not load translated content from the server.');
      return false;
    }
  }

  function updateLanguageSelector(lang) {
    document.querySelectorAll('[data-lang-switch]').forEach((el) => {
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

  function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang-switch]');
      if (!btn) return;
      e.preventDefault();
      const lang = btn.getAttribute('data-lang-switch');
      switchLanguage(lang);
    });
  }

  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!isLoaded) return;

      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) continue;
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (
            node.hasAttribute?.('data-i18n') ||
            node.querySelector?.('[data-i18n]') ||
            node.querySelector?.('[data-lang-switch]')
          ) {
            shouldUpdate = true;
            break;
          }
        }
        if (shouldUpdate) break;
      }

      if (!shouldUpdate) return;
      if (window._i18nDebounce) clearTimeout(window._i18nDebounce);
      window._i18nDebounce = setTimeout(() => {
        applyTranslations(false);
      }, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  async function init() {
    ensureFailClosedStyles();
    setLoadingState();

    if (!window.__i18nListenersSetup) {
      setupGlobalListeners();
      setupObserver();
      window.__i18nListenersSetup = true;
    }

    const lang = detectLanguage();

    try {
      await loadTranslations(lang);
      applyTranslations();
      setLoadedState();
      return true;
    } catch (err) {
      console.error('i18n init failure:', err);
      setFailedState('We could not load website content from the server.');
      return false;
    }
  }

  return {
    init,
    t,
    switchLanguage,
    applyTranslations,
    get currentLang() { return currentLang; },
    get isLoaded() { return isLoaded; },
    SUPPORTED_LANGS,
  };
})();

window.I18n = I18n;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}