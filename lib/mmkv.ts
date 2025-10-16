import { MMKV } from 'react-native-mmkv';

// Simple MMKV wrapper for key/value storage
export const storage = new MMKV({ id: 'naturalcure' });

export const setItem = (key: string, value: string) => {
  try {
    storage.set(key, value);
    return true;
  } catch (e) {
    console.warn('MMKV setItem error', e);
    return false;
  }
};

export const getItem = (key: string): string | null => {
  try {
    const v = storage.getString(key);
    return v ?? null;
  } catch (e) {
    console.warn('MMKV getItem error', e);
    return null;
  }
};

export const removeItem = (key: string) => {
  try {
    storage.delete(key);
    return true;
  } catch (e) {
    console.warn('MMKV removeItem error', e);
    return false;
  }
};

export const clearAll = () => {
  try {
    storage.clearAll();
    return true;
  } catch (e) {
    console.warn('MMKV clearAll error', e);
    return false;
  }
};
