const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const { createPaths, setAssetCacheHeaders } = require('./cacheHeaders');
const { createApiRouter } = require('./api/routes');

function createServer({ nextHandle, projectRoot }) {
  const app = express();
  const { publicDir, adminDir } = createPaths(projectRoot);

  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', createApiRouter({ projectRoot }));

  // Next.js internals for HMR/assets
  app.use('/_next/static', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    next();
  });
  app.all('/_next/*', (req, res) => nextHandle(req, res));

  app.use('/admin', express.static(adminDir, { setHeaders: setAssetCacheHeaders }));
  app.use(express.static(publicDir, { setHeaders: setAssetCacheHeaders }));

  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
  });

  // Optional Next route used only to verify runtime wiring.
  app.get('/next-health', (req, res) => nextHandle(req, res));

  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }

    if (!req.path.includes('.')) {
      return res.status(404).sendFile(path.join(publicDir, 'index.html'));
    }

    return res.status(404).send('File not found');
  });

  return app;
}

module.exports = { createServer };
