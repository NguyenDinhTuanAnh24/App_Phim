// Giả lập Redis Client trên Windows bằng In-memory Map
const memoryStore = new Map<string, { value: string; expiry: number }>();

const redisClient = {
  get: async (key: string) => {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },
  setEx: async (key: string, seconds: number, value: string) => {
    memoryStore.set(key, { value, expiry: Date.now() + seconds * 1000 });
  },
  del: async (key: string) => {
    memoryStore.delete(key);
  },
  ttl: async (key: string) => {
    const item = memoryStore.get(key);
    if (!item) return -2;
    const ttlMs = item.expiry - Date.now();
    return Math.max(0, Math.floor(ttlMs / 1000));
  },
  keys: async (pattern: string) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matchedKeys: string[] = [];
    for (const [key, item] of memoryStore.entries()) {
      if (regex.test(key) && Date.now() <= item.expiry) {
        matchedKeys.push(key);
      }
    }
    return matchedKeys;
  },
  mGet: async (keys: string[]) => {
    return keys.map((k) => {
      const item = memoryStore.get(k);
      if (!item || Date.now() > item.expiry) return null;
      return item.value;
    });
  }
};

export default redisClient;
