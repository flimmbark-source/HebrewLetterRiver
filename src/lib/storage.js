const prefix = 'hlr.';

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    // ignore
  }
  return {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {}
  };
}

export function loadState(key, fallback) {
  const store = getStorage();
  try {
    const raw = store.getItem(prefix + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('failed to parse storage', key, err);
    return fallback;
  }
}

export function saveState(key, value) {
  const store = getStorage();
  try {
    store.setItem(prefix + key, JSON.stringify(value));
  } catch (err) {
    console.warn('failed to save storage', key, err);
  }
}

export function removeState(key) {
  const store = getStorage();
  try {
    store.removeItem(prefix + key);
  } catch (err) {
    console.warn('failed to remove storage', key, err);
  }
}
