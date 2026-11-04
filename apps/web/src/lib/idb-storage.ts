// A minimal async key-value store on IndexedDB — the shape TanStack Query's async
// persister expects (getItem / setItem / removeItem). IndexedDB rather than
// localStorage because the persisted cache (food dictionary with photos, history) can
// outgrow localStorage's ~5 MB, and it doesn't block the main thread on writes.
// Any failure (private browsing, storage disabled, quota) degrades to "nothing
// stored": the app still works, it just won't remember data across restarts.

const DB_NAME = 'gym-bro';
const STORE = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

export const idbStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await run<unknown>('readonly', (store) => store.get(key));
      return typeof value === 'string' ? value : null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await run('readwrite', (store) => store.put(value, key));
    } catch {
      // Best effort — see the header comment.
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await run('readwrite', (store) => store.delete(key));
    } catch {
      // Best effort.
    }
  },
};
