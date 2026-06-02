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

// ---- Course pre-caching for full offline access ----

const DOWNLOADED_KEY = "sj_downloaded_courses";

export const isCourseDownloaded = (courseId: string): boolean => {
  try {
    const raw = localStorage.getItem(DOWNLOADED_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.includes(courseId);
  } catch {
    return false;
  }
};

const markCourseDownloaded = (courseId: string) => {
  try {
    const raw = localStorage.getItem(DOWNLOADED_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(courseId)) {
      ids.push(courseId);
      localStorage.setItem(DOWNLOADED_KEY, JSON.stringify(ids));
    }
  } catch {
    /* ignore */
  }
};

type ProgressCb = (done: number, total: number) => void;

/**
 * Pre-cache a course's data (course record, modules, lessons, assignments)
 * plus any lesson media URLs so an installed user can open everything offline.
 * `fetchers` are injected to avoid importing the supabase client here.
 */
export async function downloadCourseForOffline(
  courseId: string,
  fetchers: {
    fetchCourse: () => Promise<unknown>;
    fetchModules: () => Promise<Array<{ lessons?: Array<Record<string, unknown>> }>>;
    fetchLesson: (lessonId: string) => Promise<unknown>;
  },
  onProgress?: ProgressCb,
): Promise<void> {
  // 1. Course + modules bundle (same keys used by CoursePage queries)
  const course = await fetchers.fetchCourse();
  await cacheSet(`course:${courseId}`, course);

  const modules = await fetchers.fetchModules();
  await cacheSet(`course-modules:${courseId}`, modules);

  // 2. Collect all lessons across modules
  const lessons = modules.flatMap((m) => m.lessons ?? []);
  const mediaUrls: string[] = [];
  const total = lessons.length || 1;
  let done = 0;
  onProgress?.(done, total);

  // 3. Cache each lesson individually (same key used by LessonPage)
  for (const lesson of lessons) {
    const id = lesson.id as string;
    try {
      const full = await fetchers.fetchLesson(id);
      await cacheSet(`lesson:${id}`, full);
      const url = (lesson.content_url as string) || "";
      if (url) mediaUrls.push(url);
    } catch {
      /* skip lessons that fail; partial download is still useful */
    }
    done += 1;
    onProgress?.(done, total);
  }

  // 4. Warm the browser HTTP cache for lesson materials (best-effort)
  await Promise.allSettled(
    mediaUrls.map((url) =>
      fetch(url, { mode: "no-cors", cache: "force-cache" }).catch(() => undefined),
    ),
  );

  markCourseDownloaded(courseId);
}
