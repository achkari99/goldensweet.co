const path = require('path');

const ASSET_CACHE_MAX_AGE_SECONDS = 60 * 5;
const IMMUTABLE_CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const ASSET_CACHE_REGEX = /\.(css|js|mjs|cjs|svg|png|jpg|jpeg|gif|webp|ico|ttf|otf|woff|woff2|eot)$/i;
const HTML_CACHE_REGEX = /\.html$/i;
const JSON_CACHE_REGEX = /\.json$/i;
const IMMUTABLE_ASSET_REGEX = /(?:^|[\\/])(?:_next[\\/]static|[^\\/]+\.[a-f0-9]{8,}\.[^\\/]+)$/i;

function createPaths(projectRoot) {
  const publicDir = path.join(projectRoot, 'public');
  const adminDir = path.join(publicDir, 'admin');
  return { publicDir, adminDir };
}

function setAssetCacheHeaders(res, filePath) {
  if (HTML_CACHE_REGEX.test(filePath) || JSON_CACHE_REGEX.test(filePath)) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    return;
  }

  if (ASSET_CACHE_REGEX.test(filePath)) {
    if (IMMUTABLE_ASSET_REGEX.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${IMMUTABLE_CACHE_MAX_AGE_SECONDS}, immutable`);
      return;
    }
    res.setHeader('Cache-Control', `public, max-age=${ASSET_CACHE_MAX_AGE_SECONDS}`);
  }
}

module.exports = {
  createPaths,
  setAssetCacheHeaders,
};
