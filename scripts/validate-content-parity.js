const fs = require('fs').promises;
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_ROOT = path.join(ROOT, 'data', 'content');

function typeOfValue(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function compareShape(enValue, arValue, basePath, diffs) {
  const enType = typeOfValue(enValue);
  const arType = typeOfValue(arValue);

  if (enType !== arType) {
    diffs.push(`${basePath}: type mismatch (${enType} vs ${arType})`);
    return;
  }

  if (enType === 'object') {
    const enKeys = Object.keys(enValue);
    const arKeys = Object.keys(arValue);
    const allKeys = new Set([...enKeys, ...arKeys]);

    for (const key of allKeys) {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      const hasEn = Object.prototype.hasOwnProperty.call(enValue, key);
      const hasAr = Object.prototype.hasOwnProperty.call(arValue, key);

      if (!hasEn || !hasAr) {
        diffs.push(`${nextPath}: missing in ${hasEn ? 'ar' : 'en'}`);
        continue;
      }

      compareShape(enValue[key], arValue[key], nextPath, diffs);
    }
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(String(raw).replace(/^\uFEFF/, ''));
}

async function run() {
  const enDir = path.join(CONTENT_ROOT, 'en');
  const arDir = path.join(CONTENT_ROOT, 'ar');

  const enFiles = (await fs.readdir(enDir)).filter((name) => name.endsWith('.json'));
  const diffs = [];

  for (const fileName of enFiles) {
    const enPath = path.join(enDir, fileName);
    const arPath = path.join(arDir, fileName);

    try {
      await fs.access(arPath);
    } catch {
      diffs.push(`${fileName}: missing in ar`);
      continue;
    }

    const enJson = await readJson(enPath);
    const arJson = await readJson(arPath);
    compareShape(enJson, arJson, fileName.replace(/\.json$/, ''), diffs);
  }

  if (diffs.length > 0) {
    console.error('Content parity mismatches detected:');
    diffs.forEach((line) => console.error(`- ${line}`));
    process.exit(1);
  }

  console.log('en/ar content file shapes are in parity.');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});