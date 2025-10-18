import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { setItem } from '../lib/mmkv';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const logo = require('../assets/images/icon.png');
  // Use any available image as a decorative background. If you added a specific
  // bg image, replace the file below with it (e.g. bgImage.png).
  const bgImage = require('../assets/images/react-logo.png');
  const appConfig = require('../app.json');
  const ACCENT =
    (appConfig && appConfig.expo && appConfig.expo.android && appConfig.expo.android.adaptiveIcon && appConfig.expo.android.adaptiveIcon.backgroundColor) ||
    (appConfig && appConfig.expo && appConfig.expo.iconBackgroundColor) ||
    '#EE6E73';
  const logoMeta = Image.resolveAssetSource(logo);
  const logoAspectRatio = logoMeta && logoMeta.width && logoMeta.height ? logoMeta.width / logoMeta.height : 1;

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    } else if (data.session) {
      try {
        const userId = data.session.user?.id;
        console.log('User data:', data.session.user);
        console.log('User metadata:', data.session.user?.user_metadata);
        
        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name, phone, address')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Fallback to default user_type
          const userType = 'seller';
          setItem('user_type', userType);
          setItem('user_id', userId || '');
          setItem('user_email', data.session.user?.email || '');
          setItem('user_name', data.session.user?.user_metadata?.full_name || '');
        } else {
          console.log('Profile data:', profile);
          const userType = profile.user_type || 'seller';
          setItem('user_type', userType);
          setItem('user_id', userId || '');
          setItem('user_email', data.session.user?.email || '');
          setItem('user_name', profile.full_name || data.session.user?.user_metadata?.full_name || '');
          setItem('user_phone', profile.phone || '');
          setItem('user_address', profile.address || '');
        }
      } catch (e) {
        console.error('Error setting user data:', e);
      }
      router.replace('/products');
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Forgot Password', 'Enter your email above to receive a reset link.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert('Reset Failed', error.message);
    } else {
      Alert.alert('Check your inbox', 'We have sent you a password reset email.');
    }
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
        <View style={{ paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Image
            source={logo}
            accessibilityLabel="App icon"
            style={{ width: '100%', height: undefined, aspectRatio: 1 }}
            resizeMode="contain"
          />
        </View>

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
       
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>Sign in</Text>
            <View style={{ width: 64, height: 4, backgroundColor: ACCENT, borderRadius: 2, marginTop: 6, marginBottom: 20 }} />

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

            <Pressable onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
              <Text style={{ color: ACCENT, fontWeight: '600' }}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
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
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{loading ? 'Logging in...' : 'Login'}</Text>
            </Pressable>

            <View style={{ alignItems: 'center', marginTop: 18 }}>
              <Text style={{ color: '#6b7280' }}>
                Don’t have an Account?{' '}
                <Text style={{ color: ACCENT, fontWeight: '700' }} onPress={() => router.push('/register')}>
                  Sign up
                </Text>
              </Text>
            </View>
         
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
