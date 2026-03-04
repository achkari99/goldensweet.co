const fs = require('fs').promises;
const path = require('path');

class DataStore {
  constructor({ projectRoot }) {
    this.projectRoot = projectRoot;
    this.dataDir = process.env.VERCEL
      ? path.join('/tmp', 'data')
      : path.join(projectRoot, 'data');

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (err) {
      console.error('DataStore init error:', err);
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  async readFile(collection) {
    const filePath = this.getFilePath(collection);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        try {
          const seedPath = path.join(this.projectRoot, 'public', 'data', `${collection}.json`);
          const seedData = await fs.readFile(seedPath, 'utf8');
          const parsed = JSON.parse(seedData);
          await this.writeFile(collection, parsed);
          return parsed;
        } catch {
          return [];
        }
      }
      throw err;
    }
  }

  async writeFile(collection, data) {
    const filePath = this.getFilePath(collection);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    if (!process.env.VERCEL && collection === 'products') {
      const publicSeedPath = path.join(this.projectRoot, 'public', 'data', `${collection}.json`);
      await fs.writeFile(publicSeedPath, JSON.stringify(data, null, 2), 'utf8');
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  async getAll(collection) {
    return this.readFile(collection);
  }

  async getById(collection, id) {
    const items = await this.readFile(collection);
    const targetId = String(id);
    return items.find((item) => String(item.id) === targetId);
  }

  async create(collection, data) {
    const items = await this.readFile(collection);
    const nowIso = new Date().toISOString();
    const newItem = {
      id: this.generateId(),
      ...data,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    items.push(newItem);
    await this.writeFile(collection, items);
    return newItem;
  }

  async update(collection, id, data) {
    const items = await this.readFile(collection);
    const targetId = String(id);
    const index = items.findIndex((item) => String(item.id) === targetId);

    if (index === -1) {
      throw new Error('Item not found');
    }

    items[index] = {
      ...items[index],
      ...data,
      id: items[index].id,
      updatedAt: new Date().toISOString(),
    };

    await this.writeFile(collection, items);
    return items[index];
  }

  async delete(collection, id) {
    const items = await this.readFile(collection);
    const targetId = String(id);
    const index = items.findIndex((item) => String(item.id) === targetId);

    if (index === -1) {
      throw new Error('Item not found');
    }

    items.splice(index, 1);
    await this.writeFile(collection, items);
    return true;
  }
}

module.exports = DataStore;