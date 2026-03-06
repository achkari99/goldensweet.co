const fs = require('fs').promises;
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'public', 'locales');
const OUT_DIR = path.join(ROOT, 'data', 'content');
const LANGS = ['en', 'ar'];

const COMMON_NAMESPACES = [
  'meta',
  'nav',
  'promo',
  'footer',
  'common',
  'cart',
  'whatsapp',
  'menu_products',
  'products',
  'boutiques',
  'catalogue',
  'contact',
];

const PAGE_NAMESPACE_MAP = {
  home: ['home'],
  menu: ['menu'],
  contact: ['contact'],
  faq: ['faq'],
  franchising: ['franchising'],
  'la-maison': ['lamaison'],
  'le-laboratoire': ['laboratoire'],
  'nos-services': ['services'],
  panier: [],
  presse: ['presse'],
  'privacy-policy': ['legal'],
  'refund-policy': ['legal'],
  'terms-of-use': ['legal'],
};

function parseJson(raw, sourcePath) {
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, ''));
  } catch (err) {
    throw new Error(`Failed parsing ${sourcePath}: ${err.message}`);
  }
}

function pickNamespaces(source, namespaces) {
  const out = {};
  for (const ns of namespaces) {
    if (Object.prototype.hasOwnProperty.call(source, ns)) {
      out[ns] = source[ns];
    }
  }
  return out;
}

function ensureLegacyAliases(locale) {
  const copy = { ...locale };

  copy.footer = copy.footer || {};
  if (!('legal' in copy.footer)) {
    copy.footer.legal = copy.footer.policies || '';
  }

  copy.legal = copy.legal || {};
  if (!('terms_website_intro' in copy.legal)) {
    copy.legal.terms_website_intro = copy.legal.terms_intro || '';
  }

  copy.home = copy.home || {};
  if (!('cta_trust' in copy.home)) copy.home.cta_trust = '';
  if (!('community_hashtag' in copy.home)) copy.home.community_hashtag = '';
  if (!('faq1_q' in copy.home)) copy.home.faq1_q = '';

  return copy;
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function run() {
  for (const lang of LANGS) {
    const localePath = path.join(LOCALES_DIR, `${lang}.json`);
    const raw = await fs.readFile(localePath, 'utf8');
    const locale = ensureLegacyAliases(parseJson(raw, localePath));

    const commonData = pickNamespaces(locale, COMMON_NAMESPACES);
    await writeJson(path.join(OUT_DIR, lang, 'common.json'), commonData);

    for (const [page, namespaces] of Object.entries(PAGE_NAMESPACE_MAP)) {
      const pageData = pickNamespaces(locale, namespaces);
      await writeJson(path.join(OUT_DIR, lang, `${page}.json`), pageData);
    }
  }

  console.log('Content files generated in data/content');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
