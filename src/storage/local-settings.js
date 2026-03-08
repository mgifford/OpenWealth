const MEMORY_SETTINGS = new Map();

function hasLocalStorage() {
  return typeof globalThis !== "undefined" && !!globalThis.localStorage;
}

function cloneValue(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

export function createLocalSettingsAdapter(namespace = "openwealth") {
  const makeKey = (key) => `${namespace}:${key}`;

  return {
    get(key, fallbackValue = null) {
      const storageKey = makeKey(key);
      const rawValue = hasLocalStorage()
        ? globalThis.localStorage.getItem(storageKey)
        : MEMORY_SETTINGS.get(storageKey);

      if (rawValue === undefined || rawValue === null) {
        return cloneValue(fallbackValue);
      }

      return JSON.parse(rawValue);
    },

    set(key, value) {
      const storageKey = makeKey(key);
      const serialized = JSON.stringify(value);

      if (hasLocalStorage()) {
        globalThis.localStorage.setItem(storageKey, serialized);
      } else {
        MEMORY_SETTINGS.set(storageKey, serialized);
      }

      return cloneValue(value);
    },

    remove(key) {
      const storageKey = makeKey(key);

      if (hasLocalStorage()) {
        globalThis.localStorage.removeItem(storageKey);
      } else {
        MEMORY_SETTINGS.delete(storageKey);
      }
    }
  };
}
