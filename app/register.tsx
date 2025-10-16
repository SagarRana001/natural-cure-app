
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      console.error('Registration error:', error.message);
    } else {
      setSuccess('Account created! Please check your email to confirm your account.');
      // Don't redirect immediately, let user confirm email first
    }
    
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Natural Cure Register
      </Text>
      
      {error ? (
        <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
      
      {success ? (
        <Text style={{ color: 'green', marginBottom: 16, textAlign: 'center' }}>
          {success}
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
        onPress={handleRegister} 
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        {loading ? 'Creating Account...' : 'Register'}
      </Button>
      <Link href="/" style={{ textAlign: 'center' }}>
        <Text>Already have an account? Login</Text>
      </Link>
    </View>
  );
}
