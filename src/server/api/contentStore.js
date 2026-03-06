const fs = require('fs').promises;
const path = require('path');

const SUPPORTED_LANGS = ['en', 'ar'];
const SUPPORTED_PAGES = [
  'home',
  'menu',
  'contact',
  'faq',
  'franchising',
  'la-maison',
  'le-laboratoire',
  'nos-services',
  'panier',
  'presse',
  'privacy-policy',
  'refund-policy',
  'terms-of-use',
];

class ContentError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

class ContentStore {
  constructor({ projectRoot }) {
    this.baseDir = path.join(projectRoot, 'data', 'content');
  }

  static getSupportedLangs() {
    return SUPPORTED_LANGS.slice();
  }

  static getSupportedPages() {
    return SUPPORTED_PAGES.slice();
  }

  validateLang(lang) {
    const normalized = String(lang || '').trim().toLowerCase();
    if (!SUPPORTED_LANGS.includes(normalized)) {
      throw new ContentError('Invalid language. Supported values: en, ar', 400);
    }
    return normalized;
  }

  validatePage(page) {
    const normalized = String(page || '').trim().toLowerCase();
    if (!SUPPORTED_PAGES.includes(normalized)) {
      throw new ContentError('Invalid page identifier', 400);
    }
    return normalized;
  }

  getFilePath(lang, fileName) {
    return path.join(this.baseDir, lang, `${fileName}.json`);
  }

  parseJson(raw, filePath) {
    const cleaned = String(raw || '').replace(/^\uFEFF/, '');
    try {
      const parsed = JSON.parse(cleaned);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Content JSON must be an object');
      }
      return parsed;
    } catch (err) {
      throw new ContentError(`Invalid JSON in ${filePath}: ${err.message}`, 500);
    }
  }

  async readFileObject(lang, fileName) {
    const filePath = this.getFilePath(lang, fileName);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return this.parseJson(raw, filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new ContentError(`Content file not found: ${fileName} (${lang})`, 404);
      }
      if (err instanceof ContentError) {
        throw err;
      }
      throw new ContentError(`Failed reading content file: ${err.message}`, 500);
    }
  }

  async getCommon(lang) {
    const safeLang = this.validateLang(lang);
    return this.readFileObject(safeLang, 'common');
  }

  async getPage(lang, page) {
    const safeLang = this.validateLang(lang);
    const safePage = this.validatePage(page);
    return this.readFileObject(safeLang, safePage);
  }

  async getManifest() {
    const manifest = {
      langs: SUPPORTED_LANGS.slice(),
      pages: SUPPORTED_PAGES.slice(),
      files: {},
    };

    for (const lang of SUPPORTED_LANGS) {
      manifest.files[lang] = {};
      const names = ['common', ...SUPPORTED_PAGES];
      for (const name of names) {
        const filePath = this.getFilePath(lang, name);
        try {
          const stat = await fs.stat(filePath);
          manifest.files[lang][name] = {
            exists: true,
            mtime: stat.mtime.toISOString(),
            size: stat.size,
          };
        } catch {
          manifest.files[lang][name] = {
            exists: false,
          };
        }
      }
    }

    return manifest;
  }
}

module.exports = {
  ContentStore,
  ContentError,
};