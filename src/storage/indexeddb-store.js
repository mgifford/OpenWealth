const MEMORY_DB_REGISTRY = new Map();

function cloneValue(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function getMemoryDb(dbName) {
  if (!MEMORY_DB_REGISTRY.has(dbName)) {
    MEMORY_DB_REGISTRY.set(dbName, new Map());
  }
  return MEMORY_DB_REGISTRY.get(dbName);
}

function isIndexedDbAvailable() {
  return typeof globalThis !== "undefined" && !!globalThis.indexedDB;
}

function createMemoryStore(dbName) {
  const db = getMemoryDb(dbName);

  return {
    async get(key) {
      return db.get(key);
    },
    async put(key, value) {
      db.set(key, cloneValue(value));
      return cloneValue(value);
    },
    async delete(key) {
      db.delete(key);
    },
    async getAll() {
      return Array.from(db.values()).map((entry) => cloneValue(entry));
    }
  };
}

function openIndexedDb(dbName) {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("records")) {
        db.createObjectStore("records");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`IndexedDB open failed: ${request.error?.message ?? "unknown"}`));
  });
}

function createIndexedDbAdapter(dbName) {
  return {
    async get(key) {
      const db = await openIndexedDb(dbName);
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readonly");
        const request = tx.objectStore("records").get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async put(key, value) {
      const db = await openIndexedDb(dbName);
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readwrite");
        tx.objectStore("records").put(value, key);
        tx.oncomplete = () => resolve(value);
        tx.onerror = () => reject(tx.error);
      });
    },
    async delete(key) {
      const db = await openIndexedDb(dbName);
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readwrite");
        tx.objectStore("records").delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async getAll() {
      const db = await openIndexedDb(dbName);
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readonly");
        const request = tx.objectStore("records").getAll();
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () => reject(request.error);
      });
    }
  };
}

export function createIndexedDbStore(dbName = "openwealth-canonical") {
  if (!isIndexedDbAvailable()) {
    return createMemoryStore(dbName);
  }
  return createIndexedDbAdapter(dbName);
}
