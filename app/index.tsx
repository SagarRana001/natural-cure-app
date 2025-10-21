import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { restoreSupabaseSession } from '../lib/authService';
import { supabase } from '../lib/supabase';

export default function IndexGate() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to restore from MMKV first
        await restoreSupabaseSession();
        // Then read current session from Supabase
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        if (!mounted) return;
        router.replace(hasSession ? '/products' : '/login');
      } catch (e) {
        if (!mounted) return;
        router.replace('/login');
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return null;
}
