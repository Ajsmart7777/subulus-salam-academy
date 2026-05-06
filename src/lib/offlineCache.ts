// Lightweight offline cache for course/lesson data using IndexedDB.
// Falls back to localStorage if IndexedDB is unavailable.

const DB_NAME = "sj_offline_cache";
const STORE = "kv";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

const lsKey = (k: string) => `sj_cache:${k}`;

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem(lsKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

export async function cacheSet<T = unknown>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      localStorage.setItem(lsKey(key), JSON.stringify(value));
    } catch {
      /* quota or serialization */
    }
  }
}

/**
 * Wrap a network query so results are cached on success and served from cache
 * when the network call fails (e.g. user is offline). Throws if neither
 * network nor cache yields data.
 */
export async function withOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      void cacheSet(key, fresh);
    }
    return fresh;
  } catch (err) {
    const cached = await cacheGet<T>(key);
    if (cached !== null) return cached;
    throw err;
  }
}

export const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;
