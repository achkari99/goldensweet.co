import { promises as fs } from 'fs';
import path from 'path';

export const SUPPORTED_LANGS = ['en', 'ar'];
export const SUPPORTED_PAGES = [
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

function contentBaseDir() {
  return path.join(process.cwd(), 'data', 'content');
}

function parseJsonObject(raw, sourceName) {
  const cleaned = String(raw || '').replace(/^\uFEFF/, '');
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Content JSON must be an object');
    }
    return parsed;
  } catch (error) {
    throw new ContentError(`Invalid JSON in ${sourceName}: ${error.message}`, 500);
  }
}

export function validateLang(lang) {
  const normalized = String(lang || '').trim().toLowerCase();
  if (!SUPPORTED_LANGS.includes(normalized)) {
    throw new ContentError('Invalid language. Supported values: en, ar', 400);
  }
  return normalized;
}

export function validatePage(page) {
  const normalized = String(page || '').trim().toLowerCase();
  if (!SUPPORTED_PAGES.includes(normalized)) {
    throw new ContentError('Invalid page identifier', 400);
  }
  return normalized;
}

async function readContentObject(lang, name) {
  const filePath = path.join(contentBaseDir(), lang, `${name}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return parseJsonObject(raw, filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ContentError(`Content file not found: ${name} (${lang})`, 404);
    }
    if (error instanceof ContentError) {
      throw error;
    }
    throw new ContentError(`Failed reading content file: ${error.message}`, 500);
  }
}

export async function getCommonContent(lang) {
  const safeLang = validateLang(lang);
  return readContentObject(safeLang, 'common');
}

export async function getPageContent(lang, page) {
  const safeLang = validateLang(lang);
  const safePage = validatePage(page);
  return readContentObject(safeLang, safePage);
}

export async function getContentManifest() {
  const manifest = {
    langs: [...SUPPORTED_LANGS],
    pages: [...SUPPORTED_PAGES],
    files: {},
  };

  for (const lang of SUPPORTED_LANGS) {
    manifest.files[lang] = {};
    const names = ['common', ...SUPPORTED_PAGES];

    for (const name of names) {
      const filePath = path.join(contentBaseDir(), lang, `${name}.json`);
      try {
        const stat = await fs.stat(filePath);
        manifest.files[lang][name] = {
          exists: true,
          mtime: stat.mtime.toISOString(),
          size: stat.size,
        };
      } catch {
        manifest.files[lang][name] = { exists: false };
      }
    }
  }

  return manifest;
}

export function contentErrorStatus(error) {
  if (error instanceof ContentError && Number.isInteger(error.status)) {
    return error.status;
  }
  return 500;
}

export function contentErrorMessage(error, fallback) {
  if (error instanceof ContentError && error.message) {
    return error.message;
  }
  return fallback;
}

