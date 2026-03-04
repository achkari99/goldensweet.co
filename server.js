const path = require('path');
const next = require('next');
const dotenv = require('dotenv');
const { createServer } = require('./src/server/createServer');

dotenv.config({ path: path.join(__dirname, '.env') });

const isDev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 3000);
const nextApp = next({ dev: isDev, dir: __dirname });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

nextApp
  .prepare()
  .then(() => {
    const nextHandle = nextApp.getRequestHandler();
    const server = createServer({ nextHandle, projectRoot: __dirname });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(
          `Port ${port} is already in use. Another server is running (possibly the legacy app). ` +
            `Set a different PORT in refactor/.env (for example 3001) and restart.`
        );
        process.exit(1);
      }
      console.error('Server start error:', err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`\nRefactor server running on http://localhost:${port}`);
      console.log(`Legacy website: http://localhost:${port}`);
      console.log(`Admin panel:    http://localhost:${port}/admin`);
      console.log(`API base:       http://localhost:${port}/api`);
      console.log(`Next health:    http://localhost:${port}/next-health`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
