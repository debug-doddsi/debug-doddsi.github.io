import { useState, useEffect } from "react";

export type FlourType = "Plain" | "Wholemeal" | "Combo";

export interface FeedingImage {
  id: string;
  dataUrl: string;
  timestamp: string;
  comment: string;
}

export interface FeedingEntry {
  id: string;
  date: string;
  time: string;
  starterMass: number;
  waterMass: number;
  flourMass: number;
  flourType: FlourType;
  peakTime: string | null;
  images: FeedingImage[];
  notes: string;
  tags: string[];
  createdAt: string;
}

export function computeRatio(s: number, f: number, w: number): string {
  if (!s || !f || !w) return "—";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(gcd(Math.round(s), Math.round(f)), Math.round(w));
  return `${Math.round(s) / g}:${Math.round(f) / g}:${Math.round(w) / g}`;
}

const DB_NAME = "sourdough-tracker";
const DB_VERSION = 1;
const STORE_NAME = "feedings";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
  return dbPromise;
}

function idbRequest<T>(fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const req = fn(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

async function getAllFeedings(): Promise<FeedingEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.objectStore(STORE_NAME).index("createdAt");
    const req = index.openCursor(null, "prev");
    const results: FeedingEntry[] = [];
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const raw = cursor.value as Omit<FeedingEntry, "tags"> & { tags?: string[] };
        results.push({ tags: [], ...raw });
        cursor.continue();
      } else {
        results.sort((a, b) =>
          (b.date + "T" + b.time).localeCompare(a.date + "T" + a.time)
        );
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

async function upsertFeeding(entry: FeedingEntry): Promise<void> {
  await idbRequest((store) => store.put(entry));
}

async function deleteFeeding(id: string): Promise<void> {
  await idbRequest((store) => store.delete(id));
}

export interface UseSourdoughData {
  entries: FeedingEntry[];
  isLoading: boolean;
  addEntry: (entry: FeedingEntry) => Promise<void>;
  updateEntry: (entry: FeedingEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export function useSourdoughData(): UseSourdoughData {
  const [entries, setEntries] = useState<FeedingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () =>
    getAllFeedings()
      .then(setEntries)
      .finally(() => setIsLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const addEntry = async (entry: FeedingEntry) => {
    await upsertFeeding(entry);
    await refresh();
  };

  const updateEntry = async (entry: FeedingEntry) => {
    await upsertFeeding(entry);
    await refresh();
  };

  const deleteEntry = async (id: string) => {
    await deleteFeeding(id);
    await refresh();
  };

  return { entries, isLoading, addEntry, updateEntry, deleteEntry };
}
