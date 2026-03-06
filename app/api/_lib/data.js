import { promises as fs } from 'fs';
import path from 'path';

function getDataDir() {
  return process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
}

function getSeedPath(collection) {
  return path.join(process.cwd(), 'data', `${collection}.json`);
}

function getFilePath(collection) {
  return path.join(getDataDir(), `${collection}.json`);
}

async function ensureDataDir() {
  await fs.mkdir(getDataDir(), { recursive: true });
}

async function writeCollection(collection, data) {
  await ensureDataDir();
  await fs.writeFile(getFilePath(collection), JSON.stringify(data, null, 2), 'utf8');
}

async function readSeed(collection) {
  try {
    const raw = await fs.readFile(getSeedPath(collection), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' ? parsed : [];
  } catch {
    return [];
  }
}

export async function readCollection(collection, { objectFallback = false } = {}) {
  await ensureDataDir();
  const filePath = getFilePath(collection);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const seeded = await readSeed(collection);
    await writeCollection(collection, seeded);
    if (objectFallback && !Array.isArray(seeded)) {
      return seeded;
    }
    if (objectFallback) {
      return seeded[0] || {};
    }
    return seeded;
  }
}

export async function readList(collection) {
  const parsed = await readCollection(collection);
  return Array.isArray(parsed) ? parsed : [];
}

export async function readSingleton(collection) {
  const parsed = await readCollection(collection, { objectFallback: true });
  if (Array.isArray(parsed)) {
    return parsed[0] || {};
  }
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

export async function createItem(collection, data) {
  const list = await readList(collection);
  const nowIso = new Date().toISOString();
  const item = {
    id: generateId(),
    ...data,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  list.push(item);
  await writeCollection(collection, list);
  return item;
}

export async function updateItem(collection, id, data) {
  const list = await readList(collection);
  const targetId = String(id);
  const index = list.findIndex((item) => String(item.id) === targetId);
  if (index === -1) {
    throw new Error('Item not found');
  }

  list[index] = {
    ...list[index],
    ...data,
    id: list[index].id,
    updatedAt: new Date().toISOString(),
  };

  await writeCollection(collection, list);
  return list[index];
}

export async function deleteItem(collection, id) {
  const list = await readList(collection);
  const targetId = String(id);
  const index = list.findIndex((item) => String(item.id) === targetId);
  if (index === -1) {
    throw new Error('Item not found');
  }
  list.splice(index, 1);
  await writeCollection(collection, list);
}

export async function upsertSingleton(collection, payload) {
  const list = await readList(collection);
  if (list.length > 0) {
    list[0] = {
      ...list[0],
      ...payload,
      id: list[0].id,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const nowIso = new Date().toISOString();
    list.push({
      id: generateId(),
      ...payload,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  await writeCollection(collection, list);
  return list[0];
}

