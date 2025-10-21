import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { supabaseAnonKey, supabaseUrl } from '../constants/supabase';
import { mmkvStorageAdapter } from './supabaseMMKVAdapter';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,  // 👈 use adapter instead of raw MMKV
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
