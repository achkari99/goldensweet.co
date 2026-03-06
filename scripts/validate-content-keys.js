const fs = require('fs').promises;
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_ROOT = path.join(ROOT, 'data', 'content');
const PUBLIC_ROOT = path.join(ROOT, 'public');
const LANGS = ['en', 'ar'];

function parseJson(raw, sourcePath) {
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, ''));
  } catch (err) {
    throw new Error(`Failed parsing ${sourcePath}: ${err.message}`);
  }
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return parseJson(raw, filePath);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source || {})) {
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
  }
  return out;
}

function hasKeyPath(obj, keyPath) {
  const keys = String(keyPath).split('.');
  let cur = obj;
  for (const key of keys) {
    if (!cur || typeof cur !== 'object' || !(key in cur)) {
      return false;
    }
    cur = cur[key];
  }
  return true;
}

function extractI18nKeys(html) {
  const regex = /data-i18n(?:-alt|-placeholder|-aria|-typing)?="([^"]+)"/g;
  const keys = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    const key = String(match[1] || '').trim();
    if (key) keys.add(key);
  }
  return Array.from(keys);
}

async function collectGlobalKeys() {
  const sharedFiles = [
    path.join(PUBLIC_ROOT, 'components', 'header.html'),
    path.join(PUBLIC_ROOT, 'components', 'footer.html'),
    path.join(PUBLIC_ROOT, 'partials', 'header.html'),
  ];

  const allKeys = new Set();
  for (const filePath of sharedFiles) {
    try {
      const html = await fs.readFile(filePath, 'utf8');
      extractI18nKeys(html).forEach((k) => allKeys.add(k));
    } catch {
      // ignore missing shared files
    }
  }
  return allKeys;
}

function pageIdFromFile(filePath) {
  if (path.basename(filePath).toLowerCase() === 'index.html') {
    return 'home';
  }
  return path.basename(filePath, '.html').toLowerCase();
}

async function run() {
  const pageFiles = [
    path.join(PUBLIC_ROOT, 'index.html'),
    ...(await fs.readdir(path.join(PUBLIC_ROOT, 'pages')))
      .filter((name) => name.toLowerCase().endsWith('.html'))
      .map((name) => path.join(PUBLIC_ROOT, 'pages', name)),
  ];

  const globalKeys = await collectGlobalKeys();
  const missing = [];

  for (const lang of LANGS) {
    const common = await loadJson(path.join(CONTENT_ROOT, lang, 'common.json'));

    for (const pageFile of pageFiles) {
      const page = pageIdFromFile(pageFile);
      const pageDataPath = path.join(CONTENT_ROOT, lang, `${page}.json`);
      const pageData = await loadJson(pageDataPath);
      const merged = deepMerge(common, pageData);

      const html = await fs.readFile(pageFile, 'utf8');
      const keys = new Set([...extractI18nKeys(html), ...Array.from(globalKeys)]);

      for (const key of keys) {
        if (!hasKeyPath(merged, key)) {
          missing.push(`${lang}:${page}:${key}`);
        }
      }
    }
  }

  if (missing.length > 0) {
    console.error('Missing i18n keys in content files:');
    missing.forEach((line) => console.error(`- ${line}`));
    process.exit(1);
  }

  console.log('All data-i18n* keys are present in merged common+page content for en/ar.');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});