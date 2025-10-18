
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
const appConfig = require('../app.json');
const ACCENT =
  (appConfig && appConfig.expo && appConfig.expo.android && appConfig.expo.android.adaptiveIcon && appConfig.expo.android.adaptiveIcon.backgroundColor) ||
  (appConfig && appConfig.expo && appConfig.expo.iconBackgroundColor) ||
  '#EE6E73';
const logo = require('../assets/images/icon.png');
const bgImage = require('../assets/images/react-logo.png');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
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
      options: {
        data: {
          name,
          contactNumber,
          address,
          user_type: 'seller',
        },
      },
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
    <View style={{ flex: 1, backgroundColor: ACCENT }}>
       <KeyboardAvoidingView 
          behavior={'padding'} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
      <ImageBackground
        source={bgImage}
        resizeMode="cover"
        style={{ height: '40%', justifyContent: 'flex-end' }}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={{ paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Image source={logo} accessibilityLabel="App icon" style={{ width: '100%', height: undefined, aspectRatio: 1 }} resizeMode="contain" />
        </View>
      </ImageBackground>

      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingTop: 24,
          marginTop: -28,
        }}
      >
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>Sign up</Text>
            <View style={{ width: 64, height: 4, backgroundColor: ACCENT, borderRadius: 2, marginTop: 6, marginBottom: 20 }} />

            {error ? (
              <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
            ) : null}
            {success ? (
              <Text style={{ color: 'green', marginBottom: 12 }}>{success}</Text>
            ) : null}

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Full Name</Text>
            <TextInput
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: ACCENT,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                backgroundColor: '#fff',
              }}
            />

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Contact Number</Text>
            <TextInput
              placeholder="e.g. +1 555 123 4567"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: ACCENT,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                backgroundColor: '#fff',
              }}
            />

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Address</Text>
            <TextInput
              placeholder="Street, City, State"
              value={address}
              onChangeText={setAddress}
              multiline
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: ACCENT,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                backgroundColor: '#fff',
                minHeight: 64,
                textAlignVertical: 'top',
              }}
            />

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Email</Text>
            <TextInput
              placeholder="demo@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: ACCENT,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                backgroundColor: '#fff',
              }}
            />

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Password</Text>
            <TextInput
              placeholder="enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: ACCENT,
                borderRadius: 10,
                padding: 12,
                backgroundColor: '#fff',
              }}
            />

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={{
                backgroundColor: ACCENT,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 24,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{loading ? 'Creating Account...' : 'Register'}</Text>
            </Pressable>

            <View style={{ alignItems: 'center', marginTop: 18 }}>
              <Text style={{ color: '#6b7280' }}>
                Already have an account?{' '}
                <Text style={{ color: ACCENT, fontWeight: '700' }} onPress={() => router.push('/')}>Login</Text>
              </Text>
            </View>
          
      </View>
      </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}
