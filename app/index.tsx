import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { getItem, setItem } from '../lib/mmkv';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If a saved session exists, try to restore and redirect
    const saved = getItem('supabaseSession');
    if (saved) {
      // We assume session is valid; route to products
      router.replace('/products');
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      console.log('Login error:', error.message);
    } else {
      try {
        // Save session token for one-time login
        if (data?.session) {
          setItem('supabaseSession', JSON.stringify(data.session));
        }
      } catch (e) {
        console.warn('Failed to save session', e);
      }
      router.replace('/products');
    }
    
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Natural Cure Login
      </Text>
      
      {error ? (
        <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 16 }}
      />
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Link href="/register" style={{ textAlign: 'center' }}>
        <Text>Don't have an account? Register</Text>
      </Link>
    </View>
  );
}
