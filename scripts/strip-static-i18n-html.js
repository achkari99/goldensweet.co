const fs = require('fs').promises;
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');

async function walkHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtml(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripStaticContent(content) {
  let out = content;

  out = out.replace(
    /(<([A-Za-z][A-Za-z0-9:-]*)\b[^>]*\bdata-i18n="[^"]+"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    '$1$4'
  );

  out = out.replace(/(<[^>]*\bdata-i18n-alt="[^"]*"[^>]*\balt=")[^"]*(")/g, '$1$2');
  out = out.replace(/(<[^>]*\balt=")[^"]*("[^>]*\bdata-i18n-alt="[^"]*"[^>]*>)/g, '$1$2');

  out = out.replace(/(<[^>]*\bdata-i18n-placeholder="[^"]*"[^>]*\bplaceholder=")[^"]*(")/g, '$1$2');
  out = out.replace(/(<[^>]*\bplaceholder=")[^"]*("[^>]*\bdata-i18n-placeholder="[^"]*"[^>]*>)/g, '$1$2');

  out = out.replace(/(<[^>]*\bdata-i18n="[^"]*"[^>]*\bplaceholder=")[^"]*(")/g, '$1$2');
  out = out.replace(/(<[^>]*\bplaceholder=")[^"]*("[^>]*\bdata-i18n="[^"]*"[^>]*>)/g, '$1$2');

  out = out.replace(/(<[^>]*\bdata-i18n-aria="[^"]*"[^>]*\baria-label=")[^"]*(")/g, '$1$2');
  out = out.replace(/(<[^>]*\baria-label=")[^"]*("[^>]*\bdata-i18n-aria="[^"]*"[^>]*>)/g, '$1$2');

  return out;
}

async function run() {
  const files = await walkHtml(ROOT);
  for (const filePath of files) {
    const original = await fs.readFile(filePath, 'utf8');
    const stripped = stripStaticContent(original);
    if (stripped !== original) {
      await fs.writeFile(filePath, stripped, 'utf8');
    }
  }
  console.log(`Processed ${files.length} HTML files`);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});