
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Welcome!</Text>
      <Button mode="contained" onPress={handleLogout}>
        Logout
      </Button>
    </View>
  );
}
