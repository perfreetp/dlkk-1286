const STORAGE_KEY_PREFIX = 'release_platform_';

export const getStorageKey = (key: string): string => {
  return `${STORAGE_KEY_PREFIX}${key}`;
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return defaultValue;
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
};

export const clearAllStorage = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
};