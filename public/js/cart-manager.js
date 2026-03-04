// Cart Management System for Cinnamona
// Handles shopping cart with localStorage persistence, hover preview, and full cart page

class CartManager {
    constructor() {
        this.storageKey = 'cinnamona-cart';
        this.cart = this.loadCart();
        this.cartDisplay = document.getElementById("cart-count");
        this.cartButton = document.querySelector(".cart-icon-button");
        this.hoverPanel = null;
        this.hoverTimer = null;
        this.init();

        // Listen for language changes to update UI
        document.addEventListener('i18n:applied', () => {
            this.updateBadge();
            this.updateHoverPanel();
        });
    }

    init() {
        console.log('[CartManager] Init called, cart items:', this.getTotalItems());
        this.updateBadge();

        // Wait for header to be loaded before setting up DOM-dependent features
        if (document.querySelector('.cart-icon-button')) {
            // Header already loaded (e.g., on pages without dynamic header)
            console.log('[CartManager] Header already loaded');
            // Re-assign elements since they might have been null in constructor
            this.cartButton = document.querySelector('.cart-icon-button');
            this.cartDisplay = document.getElementById('cart-count');
            console.log('[CartManager] Re-assigned cartDisplay:', this.cartDisplay);
            this.updateBadge(); // Update badge now that we have the element
            this.setupHoverPanel();
            this.setupClickNavigation();
        } else {
            // Wait for header to load
            console.log('[CartManager] Waiting for header to load...');
            window.addEventListener('headerLoaded', () => {
                console.log('[CartManager] Header loaded event fired');
                this.cartButton = document.querySelector('.cart-icon-button');
                this.cartDisplay = document.getElementById('cart-count');
                console.log('[CartManager] cartDisplay element:', this.cartDisplay);
                this.updateBadge();
                this.setupHoverPanel();
                this.setupClickNavigation();
            });
        }

        this.setupAddToCartButtons();
    }

    loadCart() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    addProduct(product) {
        const existing = this.cart.find(item => item.name === product.name);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateBadge();
        this.updateHoverPanel();
    }

    removeProduct(productName) {
        this.cart = this.cart.filter(item => item.name !== productName);
        this.saveCart();
        this.updateBadge();
        this.updateHoverPanel();
    }

    updateQuantity(productName, newQuantity) {
        const item = this.cart.find(item => item.name === productName);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.saveCart();
            this.updateBadge();
        }
    }

    getTotalItems() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateBadge() {
        const total = this.getTotalItems();
        console.log('[CartManager] updateBadge called, total items:', total, 'cartDisplay:', this.cartDisplay);

        if (this.cartDisplay) {
            this.cartDisplay.textContent = total.toString();
            // Show badge only if there are items
            const displayValue = total > 0 ? 'flex' : 'none';
            console.log('[CartManager] Setting badge display to:', displayValue);
            this.cartDisplay.style.display = displayValue;

            // CSS requires 'active' class to show badge (transform: scale(1))
            if (total > 0) {
                this.cartDisplay.classList.add('active');
            } else {
                this.cartDisplay.classList.remove('active');
            }
        }

        if (this.cartButton) {
            const itemWord = total === 1 ? 'item' : 'items';
            this.cartButton.setAttribute('aria-label', `View cart (${total} ${itemWord})`);
        }
    }

    setupHoverPanel() {
        if (!this.cartButton) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            const existingPanels = document.querySelectorAll('.cart-hover-panel');
            existingPanels.forEach(panel => panel.remove());
            this.hoverPanel = null;
            return;
        }

        // Remove any existing hover panels to prevent duplicates
        const existingPanels = document.querySelectorAll('.cart-hover-panel');
        existingPanels.forEach(panel => panel.remove());

        this.hoverPanel = document.createElement('div');
        this.hoverPanel.className = 'cart-hover-panel';
        this.hoverPanel.setAttribute('role', 'dialog');
        this.hoverPanel.setAttribute('aria-label', 'Cart preview');

        // Append to body instead of cart button parent to escape header stacking context
        document.body.appendChild(this.hoverPanel);

        this.cartButton.addEventListener('mouseenter', () => {
            clearTimeout(this.hoverTimer);
            this.hoverTimer = setTimeout(() => {
                this.showHoverPanel();
            }, 200);
        });

        this.cartButton.addEventListener('mouseleave', (e) => {
            clearTimeout(this.hoverTimer);
            if (!this.hoverPanel.contains(e.relatedTarget)) {
                this.hoverTimer = setTimeout(() => {
                    this.hideHoverPanel();
                }, 150);
            }
        });

        this.hoverPanel.addEventListener('mouseenter', () => {
            clearTimeout(this.hoverTimer);
        });

        this.hoverPanel.addEventListener('mouseleave', () => {
            this.hoverTimer = setTimeout(() => {
                this.hideHoverPanel();
            }, 150);
        });
    }

    showHoverPanel() {
        this.updateHoverPanel();

        // Position panel relative to cart button
        const rect = this.cartButton.getBoundingClientRect();
        this.hoverPanel.style.position = 'fixed';
        const viewportPadding = 12;
        const maxTop = window.innerHeight - this.hoverPanel.offsetHeight - viewportPadding;
        const preferredTop = rect.bottom + 12;
        this.hoverPanel.style.top = `${Math.max(viewportPadding, Math.min(preferredTop, maxTop))}px`;
        this.hoverPanel.style.right = `${window.innerWidth - rect.right}px`;

        this.hoverPanel.classList.add('is-visible');
    }

    hideHoverPanel() {
        this.hoverPanel.classList.remove('is-visible');
    }

    updateHoverPanel() {
        if (!this.hoverPanel) return;

        if (this.cart.length === 0) {
            this.hoverPanel.innerHTML = `
                <div class="cart-hover-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p data-i18n="cart.empty_title">${(window.I18n && window.I18n.t) ? window.I18n.t('cart.empty_title', 'Your cart is empty') : 'Your cart is empty'}</p>
                </div>
            `;
            return;
        }

        const t = (key, fallback) => window.I18n ? window.I18n.t(key, fallback) : fallback;

        const itemsHTML = this.cart.map(item => `
            <div class="cart-hover-item">
                <div class="cart-hover-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-hover-item-info">
                    <h4 ${item.productKey ? `data-i18n="${item.productKey}"` : ''}>${item.productKey ? t(item.productKey, item.name) : item.name}</h4>
                    <p class="cart-hover-item-price">${item.price} <span data-i18n="common.currency">${t('common.currency', 'MAD')}</span> × ${item.quantity}</p>
                </div>
                <button 
                    class="cart-hover-item-remove" 
                    type="button" 
                    aria-label="Retirer ${item.name}"
                    data-remove="${item.name}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        const total = this.getTotal();

        this.hoverPanel.innerHTML = `
            <div class="cart-hover-header">
                <h3 data-i18n="cart.title">${t('cart.title', 'Mon Panier')}</h3>
                <span>${this.getTotalItems()} <span data-i18n="cart.items">${t('cart.items', 'article' + (this.getTotalItems() > 1 ? 's' : ''))}</span></span>
            </div>
            <div class="cart-hover-items">
                ${itemsHTML}
            </div>
            <div class="cart-hover-footer">
                <div class="cart-hover-total">
                    <span data-i18n="cart.total">${t('cart.total', 'Total')}</span>
                    <strong>${total} <span data-i18n="common.currency">${t('common.currency', 'MAD')}</span></strong>
                </div>
                <a href="/pages/panier.html" class="btn btn-primary btn-small cart-hover-view-btn" data-i18n="cart.title">
                    ${t('cart.title', 'Voir le panier')}
                </a>
            </div>
        `;

        this.hoverPanel.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeProduct(btn.dataset.remove);
            });
        });
    }

    setupAddToCartButtons() {
        document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
            if (button.dataset.cartBound === 'true') return;
            button.dataset.cartBound = 'true';
            button.addEventListener("click", () => {
                const productCard = button.closest('[data-product]');
                if (!productCard) return;

                const name = button.dataset.addToCart || "produit";
                const priceEl = productCard.querySelector('.product-price');
                const imageEl = productCard.querySelector('img');

                // Get translation key from the nearest h3 with data-i18n
                const nameEl = productCard.querySelector('h3[data-i18n]');
                const productKey = nameEl ? nameEl.dataset.i18n : null;

                const price = priceEl ? parseInt(priceEl.textContent.match(/\d+/)?.[0] || '0') : 0;
                const image = imageEl ? imageEl.src : '';

                const product = { name, price, image, productKey };
                this.addProduct(product);

                const total = this.getTotalItems();
                const suffixe = total === 1 ? "" : "s";
                const announce = window.announce || (() => { });
                announce(`${name} ajouté au panier. Le panier contient désormais ${total} article${suffixe}.`);

                button.classList.add("is-added");
                window.setTimeout(() => button.classList.remove("is-added"), 400);
            });
        });
    }

    setupClickNavigation() {
        if (this.cartButton) {
            this.cartButton.addEventListener('click', (e) => {
                window.location.href = '/pages/panier.html';
            });
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
