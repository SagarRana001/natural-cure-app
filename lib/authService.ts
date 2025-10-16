import { getItem, removeItem } from './mmkv';
import { supabase } from './supabase';

// Attempt to rehydrate Supabase auth from the saved MMKV session
export async function restoreSupabaseSession() {
  try {
    const raw = getItem('supabaseSession');
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // saved should contain access_token and refresh_token
    const access_token = saved?.access_token;
    const refresh_token = saved?.refresh_token;
    if (!access_token) return null;

    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      console.warn('restoreSupabaseSession: supabase.auth.setSession error', error);
      // session invalid - remove stored session
      try { removeItem('supabaseSession'); } catch (e) {}
      return null;
    }
    return data?.session ?? null;
  } catch (e) {
    console.warn('restoreSupabaseSession error', e);
    return null;
  }
}

export function clearStoredSession() {
  try {
    removeItem('supabaseSession');
  } catch (e) {
    console.warn('clearStoredSession error', e);
  }
}
