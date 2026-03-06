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

function findViolations(content, filePath) {
  const violations = [];

  const textRegex = /<([A-Za-z][A-Za-z0-9:-]*)\b[^>]*\bdata-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = textRegex.exec(content)) !== null) {
    const text = String(m[2] || '').replace(/<[^>]*>/g, '').trim();
    if (text.length > 0) {
      violations.push(`${filePath}: data-i18n node still has static text`);
      break;
    }
  }

  const attrChecks = [
    { regex: /<[^>]*\bdata-i18n-alt="[^"]*"[^>]*\balt="([^"]+)"[^>]*>/g, label: 'data-i18n-alt' },
    { regex: /<[^>]*\bdata-i18n-placeholder="[^"]*"[^>]*\bplaceholder="([^"]+)"[^>]*>/g, label: 'data-i18n-placeholder' },
    { regex: /<[^>]*\bdata-i18n="[^"]*"[^>]*\bplaceholder="([^"]+)"[^>]*>/g, label: 'data-i18n+placeholder' },
    { regex: /<[^>]*\bdata-i18n-aria="[^"]*"[^>]*\baria-label="([^"]+)"[^>]*>/g, label: 'data-i18n-aria' },
  ];

  for (const check of attrChecks) {
    let hit;
    while ((hit = check.regex.exec(content)) !== null) {
      if (String(hit[1] || '').trim().length > 0) {
        violations.push(`${filePath}: ${check.label} still has static attribute fallback`);
        break;
      }
    }
  }

  return violations;
}

async function run() {
  const files = await walkHtml(ROOT);
  const violations = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    violations.push(...findViolations(content, filePath));
  }

  if (violations.length > 0) {
    console.error('Static fallback violations detected:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('No static fallback detected in data-i18n* HTML nodes.');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});