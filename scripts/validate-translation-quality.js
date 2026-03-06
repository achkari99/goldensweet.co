const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const JSON_TARGETS = [
  path.join(ROOT, 'public', 'locales', 'en.json'),
  path.join(ROOT, 'public', 'locales', 'ar.json'),
  path.join(ROOT, 'data', 'products.json'),
  path.join(ROOT, 'public', 'data', 'products.json'),
];

const HTML_DIRS = [
  path.join(ROOT, 'public'),
  path.join(ROOT, 'public', 'pages'),
  path.join(ROOT, 'public', 'components'),
  path.join(ROOT, 'public', 'partials'),
];

const HTML_EXCLUDE = new Set([
  'menu_temp.html',
  'menu_items.html',
  'menu_items_utf8.html',
  'scroll_element.html',
]);

const CONTENT_DIR = path.join(ROOT, 'data', 'content');

// Common mojibake signatures for UTF-8 text decoded as latin1/cp1252.
const MOJIBAKE_PATTERN = /(?:\u00C3.|\u00C2.|\u00D8.|\u00D9.|\u00D0.|\u00D1.|\u00EF\u00BF\u00BD|\uFFFD)/;
const QUESTION_RUN_PATTERN = /\?{4,}/;

function parseJson(raw, sourcePath) {
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, ''));
  } catch (err) {
    throw new Error(`JSON parse failed for ${sourcePath}: ${err.message}`);
  }
}

function checkString(value) {
  const str = String(value || '');
  if (MOJIBAKE_PATTERN.test(str)) return 'mojibake';
  if (QUESTION_RUN_PATTERN.test(str)) return 'question-run';
  return null;
}

async function walkHtmlFiles(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await walkHtmlFiles(fullPath)));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        if (HTML_EXCLUDE.has(entry.name.toLowerCase())) {
          continue;
        }
        out.push(fullPath);
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function walkJsonFiles(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await walkJsonFiles(fullPath)));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
        out.push(fullPath);
      }
    }
    return out;
  } catch {
    return [];
  }
}

function inspectJson(obj, filePath, issues, basePath = '') {
  if (typeof obj === 'string') {
    const issue = checkString(obj);
    if (issue) {
      issues.push(`${filePath} :: ${basePath || '<root>'} :: ${issue}`);
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((v, i) => inspectJson(v, filePath, issues, `${basePath}[${i}]`));
    return;
  }

  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      inspectJson(value, filePath, issues, nextPath);
    }
  }
}

async function inspectHtml(filePath, issues) {
  const content = await fs.promises.readFile(filePath, 'utf8');

  if (MOJIBAKE_PATTERN.test(content)) {
    issues.push(`${filePath} :: html :: mojibake`);
  }

  if (QUESTION_RUN_PATTERN.test(content)) {
    issues.push(`${filePath} :: html :: question-run`);
  }
}

async function run() {
  const issues = [];

  const contentJsonFiles = await walkJsonFiles(CONTENT_DIR);
  const jsonFiles = [...JSON_TARGETS, ...contentJsonFiles];

  for (const filePath of jsonFiles) {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    const parsed = parseJson(raw, filePath);
    inspectJson(parsed, filePath, issues);
  }

  const htmlFiles = [];
  for (const dir of HTML_DIRS) {
    htmlFiles.push(...(await walkHtmlFiles(dir)));
  }

  const uniqueHtmlFiles = Array.from(new Set(htmlFiles));
  for (const filePath of uniqueHtmlFiles) {
    await inspectHtml(filePath, issues);
  }

  if (issues.length > 0) {
    console.error('Translation quality issues detected:');
    issues.forEach((line) => console.error(`- ${line}`));
    process.exit(1);
  }

  console.log('No mojibake or repeated-question corruption detected in translation sources.');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
