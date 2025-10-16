import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { supabaseAnonKey, supabaseUrl } from '../constants/supabase';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);