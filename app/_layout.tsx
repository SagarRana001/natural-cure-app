import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SplashScreen, Slot } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
