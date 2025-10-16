import { Slot, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { restoreSupabaseSession } from '../lib/authService';

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await restoreSupabaseSession();
      } catch (e) {
        console.warn('Failed to restore session', e);
      } finally {
        if (mounted) {
          setHydrated(true);
          // hide splash after hydration
          SplashScreen.hideAsync();
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!hydrated) return null; // don't render Slot until auth restored

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
