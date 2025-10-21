import { MMKV } from 'react-native-mmkv';

// Create your MMKV instance
const mmkv = new MMKV({ id: 'supabase' });

// Adapter that matches Supabase's SupportedStorage interface
export const mmkvStorageAdapter = {
  getItem: (key: string) => {
    const value = mmkv.getString(key);
    return Promise.resolve(value ?? null);
  },
  setItem: (key: string, value: string) => {
    mmkv.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    mmkv.delete(key);
    return Promise.resolve();
  },
};
