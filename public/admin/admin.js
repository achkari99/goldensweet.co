/**
 * Cinnamona Admin Panel JavaScript
 * Handles authentication, CRUD operations, and UI using LocalStorage
 */

const Admin = (() => {
    // Keys for LocalStorage
    const KEYS = {
        TOKEN: 'cinnamona-admin-token',
        PRODUCTS: 'cinnamona-products',
        SHOPS: 'cinnamona-shops',
        FAQS: 'cinnamona-faqs',
        CONTACTS: 'cinnamona-contacts',
        SETTINGS: 'cinnamona-settings',
        ORDERS: 'cinnamona-orders'
    };

    const API_BASE = '/api';
    const LANG_KEY = 'goldensweet-admin-lang';
    let currentUser = null;
    let currentSection = 'overview';
    let currentLang = 'en';
    let productsCache = [];
    let shopsCache = [];
    let faqsCache = [];
    let contactsCache = [];
    let mobileMenuOpen = false;

    const I18N = {
        en: {
            appTitle: 'Admin Dashboard | Golden Sweet',
            dashboard: 'Dashboard',
            products: 'Products',
            shops: 'Shops',
            faqs: 'FAQs',
            messages: 'Messages',
            settings: 'Settings',
            orderHistory: 'Order History',
            viewSite: 'View Site',
            logout: 'Logout',
            businessControl: 'Business Control',
            totalActivity: 'Total Activity',
            viewOrdersHistory: 'View Orders History',
            manageStockLevels: 'Manage Stock Levels',
            exportDataBackup: 'Export Data Backup',
            trackedFromWhatsapp: 'Tracked from WhatsApp Clicks',
            addOrder: '+ Add Order',
            addProduct: '+ Add Product',
            addShop: '+ Add Shop',
            addFaq: '+ Add FAQ',
            saveSettings: 'Save Settings',
            loadingProducts: 'Loading products...',
            noProducts: 'No products yet. Click "Add Product" to create one.',
            featured: 'Featured',
            bestSeller: 'Best-seller',
            inStock: 'In Stock',
            soldOut: 'Sold Out',
            markSoldOut: 'Mark Sold Out',
            restock: 'Restock',
            edit: 'Edit',
            del: 'Delete',
            loadingShops: 'Loading shops...',
            noShops: 'No shops yet.',
            loadingFaqs: 'Loading FAQs...',
            noFaqs: 'No FAQs yet.',
            loadingMessages: 'Loading messages...',
            noMessages: 'No messages yet.',
            view: 'View',
            markReplied: 'Mark Replied',
            noOrders: 'No orders recorded yet. Orders are tracked when users click "Order on WhatsApp".',
            whatsappSent: 'WhatsApp Sent',
            updated: 'Updated',
            deleteProductConfirm: 'Are you sure you want to delete this product?',
            deleteShopConfirm: 'Delete this shop?',
            deleteFaqConfirm: 'Delete this FAQ?',
            failedUpdateStock: 'Failed to update product stock.',
            failedDeleteProduct: 'Failed to delete product.',
            settingsSaved: 'Settings saved successfully!',
            exportFailed: 'Failed to export backup data.',
            somethingWrong: 'Something went wrong. Please try again.',
            invalidCredentials: 'Invalid credentials.',
            from: 'From',
            email: 'Email',
            phone: 'Phone',
            subject: 'Subject',
            message: 'Message',
            na: 'N/A',
            add: 'Add',
            saveProduct: 'Save Product',
            saveShop: 'Save Shop',
            saveFaq: 'Save FAQ',
            saveOrder: 'Save Order',
            englishName: 'English Name',
            arabicName: 'Arabic Name',
            category: 'Category',
            glutenFree: 'Gluten Free',
            lowCarb: 'Low Carb',
            healthy: 'Healthy',
            rawMaterials: 'Raw Materials',
            vegetarian: 'Vegetarian',
            priceMad: 'Price (MAD)',
            description: 'Description',
            arabicDescription: 'Arabic Description',
            tags: 'Tags (comma separated)',
            productImage: 'Product Image',
            currentImage: 'Current image',
            featuredHomepage: 'Featured on Homepage',
            inStockAvailable: 'In Stock / Available',
            name: 'Name',
            address: 'Address',
            hours: 'Hours',
            open247: 'Open 24/7',
            question: 'Question',
            answer: 'Answer',
            allergens: 'Allergens',
            orders: 'Orders',
            delivery: 'Delivery',
            payment: 'Payment',
            general: 'General',
            customer: 'Customer',
            items: 'Items',
            totalMad: 'Total (MAD)',
            deliveryAddress: 'Delivery Address',
            specialInstructions: 'Special Instructions',
            orderStatus: 'Status',
            cityPlaceholder: 'City, neighborhood, street...',
            instructionsPlaceholder: 'No sugar, call on arrival, gate code, etc.'
        },
        fr: {
            appTitle: 'Tableau de bord Admin | Golden Sweet',
            dashboard: 'Tableau de bord',
            products: 'Produits',
            shops: 'Boutiques',
            faqs: 'FAQs',
            messages: 'Messages',
            settings: 'Parametres',
            orderHistory: 'Historique des commandes',
            viewSite: 'Voir le site',
            logout: 'Deconnexion',
            businessControl: 'Controle entreprise',
            totalActivity: 'Activite totale',
            viewOrdersHistory: 'Voir l historique des commandes',
            manageStockLevels: 'Gerer le stock',
            exportDataBackup: 'Exporter la sauvegarde',
            trackedFromWhatsapp: 'Suivi depuis les clics WhatsApp',
            addOrder: '+ Ajouter commande',
            addProduct: '+ Ajouter produit',
            addShop: '+ Ajouter boutique',
            addFaq: '+ Ajouter FAQ',
            saveSettings: 'Enregistrer les parametres',
            loadingProducts: 'Chargement des produits...',
            noProducts: 'Aucun produit. Cliquez sur "Ajouter produit".',
            featured: 'Mis en avant',
            bestSeller: 'Meilleure vente',
            inStock: 'En stock',
            soldOut: 'Rupture',
            markSoldOut: 'Marquer en rupture',
            restock: 'Reapprovisionner',
            edit: 'Modifier',
            del: 'Supprimer',
            loadingShops: 'Chargement des boutiques...',
            noShops: 'Aucune boutique.',
            loadingFaqs: 'Chargement des FAQs...',
            noFaqs: 'Aucune FAQ.',
            loadingMessages: 'Chargement des messages...',
            noMessages: 'Aucun message.',
            view: 'Voir',
            markReplied: 'Marquer repondu',
            noOrders: 'Aucune commande enregistree. Les commandes sont suivies apres clic WhatsApp.',
            whatsappSent: 'WhatsApp envoye',
            updated: 'Mis a jour',
            deleteProductConfirm: 'Supprimer ce produit ?',
            deleteShopConfirm: 'Supprimer cette boutique ?',
            deleteFaqConfirm: 'Supprimer cette FAQ ?',
            failedUpdateStock: 'Echec mise a jour stock.',
            failedDeleteProduct: 'Echec suppression produit.',
            settingsSaved: 'Parametres enregistres.',
            exportFailed: 'Echec export sauvegarde.',
            somethingWrong: 'Une erreur est survenue. Reessayez.',
            invalidCredentials: 'Identifiants invalides.',
            from: 'De',
            email: 'Email',
            phone: 'Telephone',
            subject: 'Sujet',
            message: 'Message',
            na: 'N/D',
            add: 'Ajouter',
            saveProduct: 'Enregistrer produit',
            saveShop: 'Enregistrer boutique',
            saveFaq: 'Enregistrer FAQ',
            saveOrder: 'Enregistrer commande',
            englishName: 'Nom anglais',
            arabicName: 'Nom arabe',
            category: 'Categorie',
            glutenFree: 'Sans gluten',
            lowCarb: 'Low Carb',
            healthy: 'Sain',
            rawMaterials: 'Matieres premieres',
            vegetarian: 'Vegetarien',
            priceMad: 'Prix (MAD)',
            description: 'Description',
            arabicDescription: 'Description arabe',
            tags: 'Etiquettes (separees par virgules)',
            productImage: 'Image produit',
            currentImage: 'Image actuelle',
            featuredHomepage: 'Mis en avant accueil',
            inStockAvailable: 'En stock / Disponible',
            name: 'Nom',
            address: 'Adresse',
            hours: 'Horaires',
            open247: 'Ouvert 24/7',
            question: 'Question',
            answer: 'Reponse',
            allergens: 'Allergenes',
            orders: 'Commandes',
            delivery: 'Livraison',
            payment: 'Paiement',
            general: 'General',
            customer: 'Client',
            items: 'Articles',
            totalMad: 'Total (MAD)',
            deliveryAddress: 'Adresse de livraison',
            specialInstructions: 'Instructions speciales',
            orderStatus: 'Statut',
            cityPlaceholder: 'Ville, quartier, rue...',
            instructionsPlaceholder: 'Sans sucre, appeler a l arrivee, code portail, etc.'
        },
        ar: {
            appTitle: 'لوحة تحكم الادمن | Golden Sweet',
            dashboard: 'لوحة التحكم',
            products: 'المنتجات',
            shops: 'المتاجر',
            faqs: 'الاسئلة الشائعة',
            messages: 'الرسائل',
            settings: 'الاعدادات',
            orderHistory: 'سجل الطلبات',
            viewSite: 'عرض الموقع',
            logout: 'تسجيل الخروج',
            businessControl: 'التحكم التجاري',
            totalActivity: 'اجمالي النشاط',
            viewOrdersHistory: 'عرض سجل الطلبات',
            manageStockLevels: 'ادارة المخزون',
            exportDataBackup: 'تصدير نسخة احتياطية',
            trackedFromWhatsapp: 'متابعة من نقرات واتساب',
            addOrder: '+ اضافة طلب',
            addProduct: '+ اضافة منتج',
            addShop: '+ اضافة متجر',
            addFaq: '+ اضافة سؤال',
            saveSettings: 'حفظ الاعدادات',
            loadingProducts: 'جاري تحميل المنتجات...',
            noProducts: 'لا توجد منتجات بعد. اضغط "اضافة منتج".',
            featured: 'مميز',
            bestSeller: 'الاكثر مبيعا',
            inStock: 'متوفر',
            soldOut: 'نفد المخزون',
            markSoldOut: 'تحديد كنفد المخزون',
            restock: 'اعادة التخزين',
            edit: 'تعديل',
            del: 'حذف',
            loadingShops: 'جاري تحميل المتاجر...',
            noShops: 'لا توجد متاجر.',
            loadingFaqs: 'جاري تحميل الاسئلة...',
            noFaqs: 'لا توجد اسئلة بعد.',
            loadingMessages: 'جاري تحميل الرسائل...',
            noMessages: 'لا توجد رسائل.',
            view: 'عرض',
            markReplied: 'تم الرد',
            noOrders: 'لا توجد طلبات مسجلة بعد. يتم تسجيل الطلبات عند الضغط على "الطلب عبر واتساب".',
            whatsappSent: 'تم الارسال عبر واتساب',
            updated: 'تم التحديث',
            deleteProductConfirm: 'هل انت متاكد من حذف هذا المنتج؟',
            deleteShopConfirm: 'حذف هذا المتجر؟',
            deleteFaqConfirm: 'حذف هذا السؤال؟',
            failedUpdateStock: 'فشل تحديث المخزون.',
            failedDeleteProduct: 'فشل حذف المنتج.',
            settingsSaved: 'تم حفظ الاعدادات بنجاح.',
            exportFailed: 'فشل تصدير النسخة الاحتياطية.',
            somethingWrong: 'حدث خطا. حاول مرة اخرى.',
            invalidCredentials: 'بيانات الدخول غير صحيحة.',
            from: 'من',
            email: 'البريد الالكتروني',
            phone: 'الهاتف',
            subject: 'الموضوع',
            message: 'الرسالة',
            na: 'غير متوفر',
            add: 'اضافة',
            saveProduct: 'حفظ المنتج',
            saveShop: 'حفظ المتجر',
            saveFaq: 'حفظ السؤال',
            saveOrder: 'حفظ الطلب',
            englishName: 'الاسم بالانجليزية',
            arabicName: 'الاسم بالعربية',
            category: 'الفئة',
            glutenFree: 'بدون غلوتين',
            lowCarb: 'قليل الكربوهيدرات',
            healthy: 'صحي',
            rawMaterials: 'مواد خام',
            vegetarian: 'نباتي',
            priceMad: 'السعر (درهم)',
            description: 'الوصف',
            arabicDescription: 'الوصف بالعربية',
            tags: 'الوسوم (مفصولة بفواصل)',
            productImage: 'صورة المنتج',
            currentImage: 'الصورة الحالية',
            featuredHomepage: 'مميز في الصفحة الرئيسية',
            inStockAvailable: 'متوفر / جاهز',
            name: 'الاسم',
            address: 'العنوان',
            hours: 'ساعات العمل',
            open247: 'مفتوح 24/7',
            question: 'السؤال',
            answer: 'الجواب',
            allergens: 'الحساسية',
            orders: 'الطلبات',
            delivery: 'التوصيل',
            payment: 'الدفع',
            general: 'عام',
            customer: 'الزبون',
            items: 'المنتجات',
            totalMad: 'المجموع (درهم)',
            deliveryAddress: 'عنوان التوصيل',
            specialInstructions: 'تعليمات خاصة',
            orderStatus: 'الحالة',
            cityPlaceholder: 'المدينة، الحي، الشارع...',
            instructionsPlaceholder: 'بدون سكر، اتصل عند الوصول، رمز البوابة، الخ.'
        }
    };

    function t(key) {
        return I18N[currentLang]?.[key] || I18N.en[key] || key;
    }

    function setText(selector, value) {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    }

    function setInputPlaceholder(selector, value) {
        const el = document.querySelector(selector);
        if (el) el.setAttribute('placeholder', value);
    }

    function applyStaticTranslations() {
        document.title = t('appTitle');
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

        setText('#login-screen .login-header p', t('businessControl'));
        setText('#login-screen label[for="email"]', t('email'));
        setText('#login-screen label[for="password"]', t('orderStatus'));
        setText('#login-form button[type="submit"]', 'Sign In');
        setInputPlaceholder('#email', 'admin@goldensweet.ma');

        const navMap = {
            overview: t('dashboard'),
            orders: t('orders'),
            products: t('products'),
            shops: t('shops'),
            faqs: t('faqs'),
            contacts: t('messages'),
            settings: t('settings')
        };
        document.querySelectorAll('.nav-item').forEach((el) => {
            const section = el.dataset.section;
            const textNode = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
            if (textNode && navMap[section]) textNode.textContent = ` ${navMap[section]}`;
        });
        setText('#logout-btn', t('logout'));
        setText('.topbar-actions a.btn', t('viewSite'));

        const statLabels = document.querySelectorAll('#section-overview .stat-card p');
        if (statLabels[0]) statLabels[0].textContent = t('products');
        if (statLabels[1]) statLabels[1].textContent = t('shops');
        if (statLabels[2]) statLabels[2].textContent = t('faqs');
        if (statLabels[3]) statLabels[3].textContent = t('totalActivity');

        setText('#section-overview .quick-actions h2', t('businessControl'));
        const quickBtns = document.querySelectorAll('#section-overview .quick-actions .action-buttons .btn');
        if (quickBtns[0]) quickBtns[0].textContent = t('viewOrdersHistory');
        if (quickBtns[1]) quickBtns[1].textContent = t('manageStockLevels');
        if (quickBtns[2]) quickBtns[2].textContent = t('exportDataBackup');

        setText('#section-orders .section-header h2', t('orderHistory'));
        setText('#section-orders .badge', t('trackedFromWhatsapp'));
        setText('#section-orders .section-actions .btn', t('addOrder'));
        setText('#section-products .section-header h2', t('products'));
        setText('#section-products .section-header .btn', t('addProduct'));
        setText('#section-shops .section-header h2', t('shops'));
        setText('#section-shops .section-header .btn', t('addShop'));
        setText('#section-faqs .section-header h2', t('faqs'));
        setText('#section-faqs .section-header .btn', t('addFaq'));
        setText('#section-contacts .section-header h2', t('messages'));
        setText('#section-settings .section-header h2', t('settings'));
        setText('#settings-form button[type="submit"]', t('saveSettings'));

        document.querySelector('#section-orders thead').innerHTML = `
            <tr><th>Date</th><th>${t('customer')}</th><th>${t('items')}</th><th>Total</th><th>${t('orderStatus')}</th><th>Actions</th></tr>
        `;
        document.querySelector('#section-products thead').innerHTML = `
            <tr><th>${t('name')}</th><th>${t('category')}</th><th>Price</th><th>Inventory</th><th>Actions</th></tr>
        `;
        document.querySelector('#section-shops thead').innerHTML = `
            <tr><th>${t('name')}</th><th>${t('address')}</th><th>${t('phone')}</th><th>Actions</th></tr>
        `;
        document.querySelector('#section-faqs thead').innerHTML = `
            <tr><th>${t('question')}</th><th>${t('category')}</th><th>Actions</th></tr>
        `;
        document.querySelector('#section-contacts thead').innerHTML = `
            <tr><th>Date</th><th>${t('name')}</th><th>${t('email')}</th><th>${t('subject')}</th><th>${t('orderStatus')}</th><th>Actions</th></tr>
        `;

        showSection(currentSection);
    }

    function setLanguage(lang) {
        currentLang = I18N[lang] ? lang : 'en';
        localStorage.setItem(LANG_KEY, currentLang);
        applyStaticTranslations();
    }

    async function apiFetch(path, options = {}) {
        const token = localStorage.getItem(KEYS.TOKEN);
        const headers = options.headers ? { ...options.headers } : {};
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

        if (!isFormData && options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const message = payload?.error || `Request failed (${response.status})`;
            throw new Error(message);
        }

        return response.json();
    }

    // =====================
    // Data Management
    // =====================

    const initialData = {
        products: [
            { id: 'p1', name: 'Original Cinnamon Roll', category: 'rolls', price: 25, status: 'Active', featured: true, description: 'Classic cinnamon roll with our signature frosting.' },
            { id: 'p2', name: 'Chocolate Hazelnut', category: 'rolls', price: 30, status: 'Active', featured: true, description: 'Rich chocolate and hazelnut filling.' },
            { id: 'p3', name: 'Salted Caramel', category: 'rolls', price: 28, status: 'Active', featured: false, description: 'Topped with homemade salted caramel sauce.' },
            { id: 'p4', name: 'Box of 4', category: 'boxes', price: 95, status: 'Active', featured: false, description: 'Your choice of 4 rolls.' }
        ],
        shops: [
            { id: 's1', name: 'Cinnamona Tetouan', address: 'Tetouan, Morocco', phone: '+212 603-981438', hours: '10:00 - 22:00' }
        ],
        faqs: [
            { id: 'f1', question: 'Do you offer delivery?', category: 'delivery', answer: 'Yes, we deliver to Tetouan & Tangier.' },
            { id: 'f2', question: 'Are they vegan?', category: 'allergens', answer: 'Our standard rolls contain dairy and eggs.' }
        ],
        contacts: [
            { id: 'c1', name: 'Test User', email: 'test@example.com', subject: 'Inquiry', message: 'Do you cater for weddings?', status: 'new', createdAt: new Date().toISOString() }
        ],
        settings: {
            siteName: 'Golden Sweet',
            phone: '+212 637-629395',
            email: 'contact@goldensweet.co',
            address: 'Tetouan & Tangier, Morocco',
            deliveryFee: 40
        },
        orders: [
            { id: 'o1', customer: 'John Doe', items: '2x Original Cinnamon Roll', total: 50, date: new Date().toISOString(), status: 'WhatsApp Sent' }
        ]
    };

    function loadData(key) {
        const stored = localStorage.getItem(key);
        if (!stored) {
            // Initialize with default data if empty
            const defaultKey = key.replace('cinnamona-', '');
            if (initialData[defaultKey]) {
                localStorage.setItem(key, JSON.stringify(initialData[defaultKey]));
                return initialData[defaultKey];
            }
            return [];
        }
        const parsed = JSON.parse(stored);
        if (key === KEYS.SETTINGS) {
            let dirty = false;
            if (parsed?.siteName === 'Cinnamona by Mona' || parsed?.siteName === 'Cinnamona') {
                parsed.siteName = 'Golden Sweet';
                dirty = true;
            }
            if (parsed?.email === 'bonjour@cinnamona.ma') {
                parsed.email = 'contact@goldensweet.co';
                dirty = true;
            }
            const parsedDeliveryFee = Number(parsed?.deliveryFee);
            if (!Number.isFinite(parsedDeliveryFee) || parsedDeliveryFee < 0) {
                parsed.deliveryFee = 40;
                dirty = true;
            }
            if (dirty) {
                localStorage.setItem(key, JSON.stringify(parsed));
            }
        }
        return parsed;
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function normalizeSettings(raw = {}) {
        const parsedDeliveryFee = Number(raw.deliveryFee);
        const deliveryFee = Number.isFinite(parsedDeliveryFee) && parsedDeliveryFee >= 0
            ? parsedDeliveryFee
            : 40;

        return {
            ...raw,
            deliveryFee
        };
    }

    // =====================
    // Authentication
    // =====================

    async function login(email, password) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        const normalizedEmail = String(email || '').trim();
        const normalizedPassword = String(password || '');

        try {
            const result = await apiFetch('/auth-login', {
                method: 'POST',
                body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
            });
            localStorage.setItem(KEYS.TOKEN, result.token);
            currentUser = result.user;
            showDashboard();
            loadStats();
        } catch (err) {
            errorEl.textContent = err.message || 'Invalid credentials.';
        }
    }

    function logout() {
        localStorage.removeItem(KEYS.TOKEN);
        currentUser = null;
        closeMobileMenu();
        showLogin();
    }

    async function checkAuth() {
        const token = localStorage.getItem(KEYS.TOKEN);
        if (!token) {
            showLogin();
            return;
        }

        try {
            const result = await apiFetch('/auth-me');
            currentUser = result.user;
            showDashboard();
            loadStats();
        } catch (err) {
            logout();
        }
    }

    function showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    function showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    function openMobileMenu() {
        const dashboard = document.getElementById('dashboard');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        const btn = document.getElementById('mobile-menu-btn');
        if (!dashboard || !backdrop || !btn) return;
        mobileMenuOpen = true;
        dashboard.classList.add('menu-open');
        backdrop.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        const dashboard = document.getElementById('dashboard');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        const btn = document.getElementById('mobile-menu-btn');
        if (!dashboard || !backdrop || !btn) return;
        mobileMenuOpen = false;
        dashboard.classList.remove('menu-open');
        backdrop.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
    }

    function toggleMobileMenu() {
        if (mobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // =====================
    // Navigation
    // =====================

    function showSection(section) {
        currentSection = section;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });

        // Update title
        const titles = {
            overview: 'Dashboard',
            products: 'Products',
            shops: 'Shops',
            faqs: 'FAQs',
            contacts: 'Messages',
            settings: 'Settings',
            orders: 'Order History'
        };
        document.getElementById('page-title').textContent = titles[section] || 'Dashboard';

        // Load section data
        loadSectionData(section);
        closeMobileMenu();
    }

    function loadSectionData(section) {
        switch (section) {
            case 'products': renderProducts(); break;
            case 'shops': renderShops(); break;
            case 'faqs': renderFaqs(); break;
            case 'contacts': renderContacts(); break;
            case 'settings': renderSettings(); break;
            case 'orders': renderOrders(); break;
        }
    }

    // =====================
    // Stats
    // =====================

    async function loadStats() {
        const orders = loadData(KEYS.ORDERS);
        const settings = loadData(KEYS.SETTINGS);
        let productCount = 0;
        let shopCount = 0;
        let faqCount = 0;
        let contactCount = 0;

        try {
            const result = await apiFetch('/products');
            productCount = result.data?.length || 0;
        } catch (err) {
            productCount = 0;
        }

        try {
            const result = await apiFetch('/shops');
            shopCount = result.data?.length || 0;
        } catch (err) {
            shopCount = 0;
        }

        try {
            const result = await apiFetch('/faqs');
            faqCount = result.data?.length || 0;
        } catch (err) {
            faqCount = 0;
        }

        try {
            const result = await apiFetch('/contacts');
            const contacts = result.data || [];
            contactCount = contacts.filter(c => c.status === 'new').length;
        } catch (err) {
            contactCount = 0;
        }

        document.getElementById('stat-products').textContent = productCount;
        document.getElementById('stat-shops').textContent = shopCount;
        document.getElementById('stat-faqs').textContent = faqCount;
        document.getElementById('stat-contacts').textContent = contactCount + orders.length;

        // Update site name in dashboard header if changed
        if (settings.siteName) {
            document.querySelectorAll('.sidebar-header h2, .login-header h1').forEach(el => el.textContent = settings.siteName);
        }
    }

    // =====================
    // Products CRUD
    // =====================

    async function renderProducts() {
        const tbody = document.getElementById('products-table');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">Loading products...</td></tr>';

        try {
            const result = await apiFetch('/products');
            const products = result.data || [];
            productsCache = products;

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No products yet. Click "Add Product" to create one.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => {
                const thumb = p.image ? `<img class="product-thumb" src="${p.image}" alt="${p.name}">` : '';
                const featuredBadge = p.featured ? '<span class="badge badge-replied" style="font-size:0.75em; margin-left:8px">Featured</span>' : '';
                const bestBadge = p.bestSeller ? '<span class="badge badge-active" style="font-size:0.75em; margin-left:8px">Best-seller</span>' : '';
                const inStock = p.inStock !== false;
                const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []);
                return `
                    <tr>
                        <td>
                            <div class="product-cell">
                                ${thumb}
                                <div class="product-meta">
                                    <strong>${p.name}</strong>
                                    ${featuredBadge}${bestBadge}
                                    ${tags.length ? `<small>${tags.join(', ')}</small>` : ''}
                                </div>
                            </div>
                        </td>
                        <td>${p.category || '-'}</td>
                        <td>${p.price} MAD</td>
                        <td><span class="badge ${inStock ? 'badge-active' : 'badge-danger'}">${inStock ? 'In Stock' : 'Sold Out'}</span></td>
                        <td class="actions">
                            <button class="btn btn-outline btn-small" onclick="Admin.toggleStock('${p.id}', ${inStock})">${inStock ? 'Mark Sold Out' : 'Restock'}</button>
                            <button class="btn btn-outline btn-small" onclick="Admin.editProduct('${p.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function uploadProductImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const result = await apiFetch('/upload', {
            method: 'POST',
            body: formData
        });
        return result.data?.path || '';
    }

    async function saveProduct(data, id = null, imageFile = null) {
        const payload = {
            name: data.name?.trim(),
            nameAr: data.nameAr?.trim() || '',
            category: data.category || '',
            price: Number(data.price || 0),
            description: data.description || '',
            descriptionAr: data.descriptionAr?.trim() || '',
            featured: data.featured === 'on',
            bestSeller: data.bestSeller === 'on',
            inStock: data.inStock === 'on',
            image: data.image || '',
            tags: data.tags
                ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                : []
        };

        if (imageFile && imageFile.size > 0) {
            payload.image = await uploadProductImage(imageFile);
        }

        if (id) {
            await apiFetch(`/product?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        closeModal();
        renderProducts();
        loadStats();
    }

    async function toggleStock(id, currentInStock) {
        try {
            await apiFetch(`/product?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify({ inStock: !currentInStock })
            });
            renderProducts();
        } catch (err) {
            alert(err.message || 'Failed to update product stock.');
        }
    }

    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await apiFetch(`/product?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            renderProducts();
            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to delete product.');
        }
    }

    function editProduct(id) {
        const targetId = String(id);
        const product = productsCache.find(p => String(p.id) === targetId);
        if (product) openModal('product', product);
    }

    // =====================
    // Shops CRUD
    // =====================

    async function renderShops() {
        const tbody = document.getElementById('shops-table');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem">Loading shops...</td></tr>';

        try {
            const result = await apiFetch('/shops');
            const shops = result.data || [];
            shopsCache = shops;

            if (shops.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem">No shops yet.</td></tr>';
                return;
            }

            tbody.innerHTML = shops.map(s => `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.address || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-outline btn-small" onclick="Admin.editShop('${s.id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="Admin.deleteShop('${s.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function saveShop(data, id = null) {
        const payload = {
            name: data.name?.trim(),
            address: data.address || '',
            phone: data.phone || '',
            hours: data.hours || ''
        };

        if (id) {
            await apiFetch(`/shop?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/shops', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeModal();
        renderShops();
        loadStats();
    }

    async function deleteShop(id) {
        if (!confirm('Delete this shop?')) return;
        await apiFetch(`/shop?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        renderShops();
        loadStats();
    }

    function editShop(id) {
        const shop = shopsCache.find(s => s.id === id);
        if (shop) openModal('shop', shop);
    }

    // =====================
    // FAQs CRUD
    // =====================

    async function renderFaqs() {
        const tbody = document.getElementById('faqs-table');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Loading FAQs...</td></tr>';

        try {
            const result = await apiFetch('/faqs');
            const faqs = result.data || [];
            faqsCache = faqs;

            if (faqs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">No FAQs yet.</td></tr>';
                return;
            }

            tbody.innerHTML = faqs.map(f => `
                <tr>
                    <td>${f.question}</td>
                    <td>${f.category || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-outline btn-small" onclick="Admin.editFaq('${f.id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="Admin.deleteFaq('${f.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function saveFaq(data, id = null) {
        const payload = {
            category: data.category || '',
            question: data.question || '',
            answer: data.answer || ''
        };

        if (id) {
            await apiFetch(`/faq?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/faqs', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeModal();
        renderFaqs();
        loadStats();
    }

    async function deleteFaq(id) {
        if (!confirm('Delete this FAQ?')) return;
        await apiFetch(`/faq?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        renderFaqs();
        loadStats();
    }

    function editFaq(id) {
        const faq = faqsCache.find(f => f.id === id);
        if (faq) openModal('faq', faq);
    }

    // =====================
    // Contacts
    // =====================

    async function renderContacts() {
        const tbody = document.getElementById('contacts-table');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">Loading messages...</td></tr>';

        try {
            const result = await apiFetch('/contacts');
            const contacts = result.data || [];
            contactsCache = contacts;

            if (contacts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No messages yet.</td></tr>';
                return;
            }

            tbody.innerHTML = contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => `
                <tr>
                    <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                    <td><strong>${c.name}</strong></td>
                    <td><a href="mailto:${c.email}">${c.email}</a></td>
                    <td>${c.subject || '-'}</td>
                    <td><span class="badge badge-${c.status}">${c.status}</span></td>
                    <td class="actions">
                        <button class="btn btn-outline btn-small" onclick="Admin.viewContact('${c.id}')">View</button>
                        <button class="btn btn-small" onclick="Admin.markReplied('${c.id}')">Mark Replied</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    function viewContact(id) {
        const contact = contactsCache.find(c => c.id === id);
        if (contact) {
            alert(`From: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nSubject: ${contact.subject || 'N/A'}\n\nMessage:\n${contact.message}`);
        }
    }

    async function markReplied(id) {
        await apiFetch(`/contact-admin?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'replied' })
        });
        renderContacts();
        loadStats();
    }

    // =====================
    // Orders Tracking
    // =====================

    function renderOrders() {
        const orders = loadData(KEYS.ORDERS);
        const tbody = document.getElementById('orders-table');

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No orders recorded yet. Orders are tracked when users click "Order on WhatsApp".</td></tr>';
            return;
        }

        tbody.innerHTML = orders
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(o => `
            <tr>
                <td>${new Date(o.date).toLocaleString()}</td>
                <td><strong>${o.customer}</strong><br><small>${o.phone || ''}</small></td>
                <td><small>${o.items}</small></td>
                <td>${o.total} MAD</td>
                <td><span class="badge badge-replied">${o.status || 'WhatsApp Sent'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-small" data-edit-order="${o.id}">Edit</button>
                        <button class="btn btn-danger btn-small" data-delete-order="${o.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-edit-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = orders.find(o => o.id === btn.dataset.editOrder);
                openModal('order', order);
            });
        });

        tbody.querySelectorAll('[data-delete-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteOrder(btn.dataset.deleteOrder);
            });
        });
    }

    /**
     * Public method to record an order from other scripts
     */
    function recordOrder(orderData) {
        const orders = loadData(KEYS.ORDERS);
        orders.push({
            id: 'o' + Date.now(),
            date: new Date().toISOString(),
            status: 'WhatsApp Sent',
            ...orderData
        });
        saveData(KEYS.ORDERS, orders);
    }

    function saveOrder(orderData, id) {
        const orders = loadData(KEYS.ORDERS);
        if (id) {
            const idx = orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                orders[idx] = { ...orders[idx], ...orderData, id };
            }
        } else {
            orders.push({
                id: 'o' + Date.now(),
                date: new Date().toISOString(),
                status: 'Updated',
                ...orderData
            });
        }
        saveData(KEYS.ORDERS, orders);
        renderOrders();
        loadStats();
    }

    function deleteOrder(id) {
        const orders = loadData(KEYS.ORDERS).filter(o => o.id !== id);
        saveData(KEYS.ORDERS, orders);
        renderOrders();
        loadStats();
    }

    // =====================
    // Settings
    // =====================

    function applySettingsToForm(settings = {}) {
        document.getElementById('site-name').value = settings.siteName || '';
        document.getElementById('site-phone').value = settings.phone || '';
        document.getElementById('site-email').value = settings.email || '';
        document.getElementById('site-address').value = settings.address || '';
        document.getElementById('delivery-fee').value = settings.deliveryFee ?? 40;
    }

    async function renderSettings() {
        const localSettings = normalizeSettings(loadData(KEYS.SETTINGS) || {});
        applySettingsToForm(localSettings);

        try {
            const result = await apiFetch('/settings');
            const remoteSettings = result?.data && typeof result.data === 'object'
                ? normalizeSettings({ ...localSettings, ...result.data })
                : localSettings;
            saveData(KEYS.SETTINGS, remoteSettings);
            applySettingsToForm(remoteSettings);
        } catch (err) {
            // Keep local values if API settings cannot be loaded.
        }
    }

    async function saveSettings(data) {
        try {
            const payload = normalizeSettings({
                siteName: data.siteName,
                phone: data.phone,
                email: data.email,
                address: data.address,
                deliveryFee: data.deliveryFee
            });

            const result = await apiFetch('/settings', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            const savedSettings = normalizeSettings(result?.data || payload);
            saveData(KEYS.SETTINGS, savedSettings);
            applySettingsToForm(savedSettings);
            alert(t('settingsSaved', 'Settings saved successfully!'));
        } catch (err) {
            alert(err.message || t('somethingWrong', 'Something went wrong. Please try again.'));
        }
    }

    // =====================
    // Export Data
    // =====================

    async function exportData() {
        try {
            const [productsRes, shopsRes, faqsRes, contactsRes, settingsRes] = await Promise.all([
                apiFetch('/products'),
                apiFetch('/shops'),
                apiFetch('/faqs'),
                apiFetch('/contacts'),
                apiFetch('/settings')
            ]);

            const backup = {
                exportedAt: new Date().toISOString(),
                data: {
                    products: productsRes.data || [],
                    shops: shopsRes.data || [],
                    faqs: faqsRes.data || [],
                    contacts: contactsRes.data || [],
                    settings: settingsRes.data || {},
                    orders: loadData(KEYS.ORDERS) || []
                }
            };

            const stamp = new Date().toISOString().slice(0, 10);
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `goldensweet-backup-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.message || 'Failed to export backup data.');
        }
    }

    // =====================
    // Modal
    // =====================

    function openModal(type, data = null) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        const isEdit = !!data;
        title.textContent = isEdit ? `Edit ${type}` : `Add ${type}`;

        const forms = {
            product: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <input type="hidden" name="image" value="${data?.image || ''}">
                    <div class="form-group">
                        <label>English Name</label>
                        <input type="text" name="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Arabic Name</label>
                        <input type="text" name="nameAr" dir="rtl" value="${data?.nameAr || data?.name_ar || data?.nameArabic || ''}">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="gluten-vegetarian" ${data?.category === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
                            <option value="gluten-free" ${data?.category === 'gluten-free' ? 'selected' : ''}>Gluten Free</option>
                            <option value="low-carb" ${data?.category === 'low-carb' ? 'selected' : ''}>Low Carb</option>
                            <option value="healthy" ${data?.category === 'healthy' ? 'selected' : ''}>Healthy</option>
                            <option value="raw-materials" ${data?.category === 'raw-materials' ? 'selected' : ''}>Raw Materials</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price (MAD)</label>
                        <input type="number" name="price" required value="${data?.price || ''}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3">${data?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Arabic Description</label>
                        <textarea name="descriptionAr" rows="3" dir="rtl">${data?.descriptionAr || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" name="tags" value="${Array.isArray(data?.tags) ? data.tags.join(', ') : (data?.tags || '')}">
                    </div>
                    <div class="form-group">
                        <label>Product Image</label>
                        ${data?.image ? `
                            <div class="image-preview" data-image-preview>
                                <img src="${data.image}" alt="${data.name || 'Product image'}">
                                <span>Current image</span>
                                <button type="button" class="image-remove-btn" data-remove-image aria-label="Remove current image">x</button>
                            </div>
                        ` : ''}
                        <input type="file" name="imageFile" accept="image/*" ${data?.image ? '' : 'required'}>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="featured-check" name="featured" ${data?.featured ? 'checked' : ''} style="width: auto; margin: 0;">
                        <label for="featured-check" style="margin: 0; font-weight: normal;">Featured on Homepage</label>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; gap: 1.25rem; flex-wrap: wrap;">
                        <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                            <input type="checkbox" name="bestSeller" ${data?.bestSeller ? 'checked' : ''} style="width: auto; margin: 0;">
                            Best-seller
                        </label>
                    </div>
                    <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="instock-check" name="inStock" ${data?.inStock !== false ? 'checked' : ''} style="width: auto; margin: 0;">
                        <label for="instock-check" style="margin: 0; font-weight: normal;">In Stock / Available</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Product</button>
                </form>
            `,
            shop: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea name="address" rows="2">${data?.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${data?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Hours</label>
                        <input type="text" name="hours" value="${data?.hours || 'Open 24/7'}">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Shop</button>
                </form>
            `,
            faq: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="allergens" ${data?.category === 'allergens' ? 'selected' : ''}>Allergens</option>
                            <option value="orders" ${data?.category === 'orders' ? 'selected' : ''}>Orders</option>
                            <option value="delivery" ${data?.category === 'delivery' ? 'selected' : ''}>Delivery</option>
                            <option value="payment" ${data?.category === 'payment' ? 'selected' : ''}>Payment</option>
                            <option value="general" ${data?.category === 'general' ? 'selected' : ''}>General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <input type="text" name="question" required value="${data?.question || ''}">
                    </div>
                    <div class="form-group">
                        <label>Answer</label>
                        <textarea name="answer" rows="4" required>${data?.answer || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save FAQ</button>
                </form>
            `,
            order: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Customer</label>
                        <input type="text" name="customer" required value="${data?.customer || ''}">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${data?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Items</label>
                        <textarea name="items" rows="3" required>${data?.items || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Total (MAD)</label>
                        <input type="number" name="total" min="0" step="0.01" required value="${data?.total || ''}">
                    </div>
                    <div class="form-group">
                        <label>Delivery Address</label>
                        <textarea name="address" rows="2" placeholder="City, neighborhood, street...">${data?.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Special Instructions</label>
                        <textarea name="instructions" rows="2" placeholder="No sugar, call on arrival, gate code, etc.">${data?.instructions || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            ${['WhatsApp Sent','Pending','Confirmed','Preparing','Ready','Delivered','Cancelled'].map(s => `
                                <option value="${s}" ${data?.status === s ? 'selected' : ''}>${s}</option>
                            `).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Order</button>
                </form>
            `
        };

        body.innerHTML = forms[type] || '';
        modal.classList.remove('hidden');

        if (type === 'product') {
            const form = document.getElementById('modal-form');
            const removeImageBtn = form.querySelector('[data-remove-image]');
            if (removeImageBtn) {
                removeImageBtn.addEventListener('click', () => {
                    const hiddenImageInput = form.querySelector('input[name="image"]');
                    const imagePreview = form.querySelector('[data-image-preview]');
                    const imageFileInput = form.querySelector('input[name="imageFile"]');
                    if (hiddenImageInput) hiddenImageInput.value = '';
                    if (imagePreview) imagePreview.remove();
                    if (imageFileInput) imageFileInput.required = true;
                });
            }
        }

        // Form submit handler
        document.getElementById('modal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id') || null;

            try {
                switch (type) {
                    case 'product': {
                        const imageFile = formData.get('imageFile');
                        const data = {
                            name: formData.get('name'),
                            nameAr: (formData.get('nameAr') || '').trim(),
                            category: formData.get('category'),
                            price: formData.get('price'),
                            description: formData.get('description'),
                            descriptionAr: (formData.get('descriptionAr') || '').trim(),
                            featured: formData.get('featured'),
                            bestSeller: formData.get('bestSeller'),
                            inStock: formData.get('inStock'),
                            tags: formData.get('tags'),
                            image: formData.get('image')
                        };
                        await saveProduct(data, id, imageFile);
                        break;
                    }
                    case 'shop':
                        {
                            const data = Object.fromEntries(formData);
                            delete data.id;
                            await saveShop(data, id);
                        }
                        break;
                    case 'faq':
                        {
                            const data = Object.fromEntries(formData);
                            delete data.id;
                            await saveFaq(data, id);
                        }
                        break;
                    case 'order': {
                        const data = Object.fromEntries(formData);
                        const numericTotal = Number(data.total || 0);
                        data.total = Number.isFinite(numericTotal) ? numericTotal : 0;
                        delete data.id;
                        saveOrder(data, id);
                        break;
                    }
                }
            } catch (err) {
                alert(err.message || 'Something went wrong. Please try again.');
            }
        });
    }

    function closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    // =====================
    // Init
    // =====================

    function init() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            login(email, password);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', logout);

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(item.dataset.section);
            });
        });

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        const mobileBackdrop = document.getElementById('mobile-sidebar-backdrop');
        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', closeMobileMenu);
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMobileMenu();
        });

        // Settings form
        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await saveSettings(Object.fromEntries(formData));
        });

        // Modal close on backdrop click
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') closeModal();
        });

        // Check auth on load
        checkAuth();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        showSection,
        openModal,
        closeModal,
        editProduct,
        deleteProduct,
        editShop,
        deleteShop,
        editFaq,
        deleteFaq,
        viewContact,
        markReplied,
        exportData,
        recordOrder,
        toggleStock
    };
})();
