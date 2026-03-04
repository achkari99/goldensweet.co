const express = require('express');
const jwt = require('jsonwebtoken');
const DataStore = require('./dataStore');
const { authMiddleware } = require('./auth');
const { createUploader } = require('./upload');

function getEntityId(req) {
  const rawId = req.params?.id ?? req.query?.id;
  return rawId == null ? '' : String(rawId).trim();
}

function createApiRouter({ projectRoot }) {
  const router = express.Router();
  const store = new DataStore({ projectRoot });
  const upload = createUploader({ projectRoot });

  router.post(['/auth/login', '/auth-login'], async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const expectedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const expectedPassword = String(process.env.ADMIN_PASSWORD || '');
    const jwtSecret = String(process.env.JWT_SECRET || '');

    if (!expectedEmail || !expectedPassword || !jwtSecret) {
      return res.status(500).json({ success: false, error: 'Server auth is not configured' });
    }

    const inputEmail = String(email).trim().toLowerCase();
    const inputPassword = String(password);

    if (inputEmail === expectedEmail && inputPassword === expectedPassword) {
      const token = jwt.sign({ email: inputEmail, role: 'admin' }, jwtSecret, { expiresIn: '24h' });
      return res.json({ success: true, token, user: { email: inputEmail, role: 'admin' } });
    }

    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  });

  router.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
      hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    });
  });

  router.get(['/auth/me', '/auth-me'], authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  router.get('/products', async (req, res) => {
    try {
      const products = await store.getAll('products');
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get(['/products/:id', '/product'], async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product id is required' });
      }
      const product = await store.getById('products', id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      return res.json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/products', authMiddleware, async (req, res) => {
    try {
      const product = await store.create('products', req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put(['/products/:id', '/product'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product id is required' });
      }
      const product = await store.update('products', id, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.delete(['/products/:id', '/product'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product id is required' });
      }
      await store.delete('products', id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/shops', async (req, res) => {
    try {
      const shops = await store.getAll('shops');
      res.json({ success: true, data: shops });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/shops', authMiddleware, async (req, res) => {
    try {
      const shop = await store.create('shops', req.body);
      res.status(201).json({ success: true, data: shop });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put(['/shops/:id', '/shop'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Shop id is required' });
      }
      const shop = await store.update('shops', id, req.body);
      res.json({ success: true, data: shop });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.delete(['/shops/:id', '/shop'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Shop id is required' });
      }
      await store.delete('shops', id);
      res.json({ success: true, message: 'Shop deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/faqs', async (req, res) => {
    try {
      const faqs = await store.getAll('faqs');
      res.json({ success: true, data: faqs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/faqs', authMiddleware, async (req, res) => {
    try {
      const faq = await store.create('faqs', req.body);
      res.status(201).json({ success: true, data: faq });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put(['/faqs/:id', '/faq'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'FAQ id is required' });
      }
      const faq = await store.update('faqs', id, req.body);
      res.json({ success: true, data: faq });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.delete(['/faqs/:id', '/faq'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'FAQ id is required' });
      }
      await store.delete('faqs', id);
      res.json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/settings', async (req, res) => {
    try {
      const settings = await store.getAll('settings');
      res.json({ success: true, data: settings[0] || {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put('/settings', authMiddleware, async (req, res) => {
    try {
      let settings = await store.getAll('settings');
      if (settings.length > 0) {
        settings = await store.update('settings', settings[0].id, req.body);
      } else {
        settings = await store.create('settings', req.body);
      }
      res.json({ success: true, data: settings });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    return res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/images/${req.file.filename}`,
        size: req.file.size,
      },
    });
  });

  router.post('/contact', async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Name, email and message required' });
      }

      const contact = await store.create('contacts', {
        name,
        email,
        phone,
        subject,
        message,
        status: 'new',
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ success: true, message: 'Message received', data: contact });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/contacts', authMiddleware, async (req, res) => {
    try {
      const contacts = await store.getAll('contacts');
      res.json({ success: true, data: contacts });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put(['/contacts/:id', '/contact-admin'], authMiddleware, async (req, res) => {
    try {
      const id = getEntityId(req);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Contact id is required' });
      }
      const contact = await store.update('contacts', id, req.body);
      return res.json({ success: true, data: contact });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createApiRouter };