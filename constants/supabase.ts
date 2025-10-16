// Supabase Configuration
// Replace these with your actual Supabase credentials
// Get them from: https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api

// Method 1: Using environment variables (recommended)
// export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co";
// export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your_anon_key_here";

// Method 2: Direct configuration (for testing)
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS:
// Get these from: https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://unewithnpwknqtqohlpv.supabase.co";
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXdpdGhucHdrbnF0cW9obHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzAzMzIsImV4cCI6MjA3NTcwNjMzMn0.htyL3OJqjVO9smGZeJKk29KrdzTwwVVeEgjBl_zVeMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);