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
        // 1️⃣ Try restoring the Supabase session manually (if needed)
        await restoreSupabaseSession();

        // 2️⃣ Get the current session (from Supabase's MMKV adapter)
        const { data, error } = await supabase.auth.getSession();

        if (error) console.warn('getSession error:', error);

        const hasSession = !!data.session;

        // 3️⃣ Optional: Check auth.uid() via RPC to ensure it’s valid
        // const { data: uidCheck } = await supabase.rpc('uid_check');
        // console.log('auth.uid():', uidCheck);

        if (!mounted) return;

        // 4️⃣ Route user to correct screen
        if (hasSession) {
          router.replace('/products');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.warn('IndexGate error:', e);
        if (mounted) router.replace('/login');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
