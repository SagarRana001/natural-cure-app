import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { restoreSupabaseSession } from '../lib/authService';
import { setItem } from '../lib/mmkv';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logo = require('../assets/images/icon.png');

  // THEME COLORS (same as Products screen)
  const COLORS = {
    background: '#f5efe4',
    card: '#fff8e1',
    primary: '#618000',
    textDark: '#321901',
    textLight: '#6b7280',
    buttonDark: '#2a3e00',
  };

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else if (data.session) {
      try {
        const userId = data.session.user?.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, full_name, phone, address')
          .eq('id', userId)
          .single();

        setItem('user_type', profile?.user_type || 'seller');
        setItem('user_id', userId || '');
        setItem('user_email', data.session.user?.email || '');
        setItem('user_name', profile?.full_name || '');
        setItem('user_phone', profile?.phone || '');
        setItem('user_address', profile?.address || '');
      } catch (e) {
        console.error('Login setup error:', e);
      }
      await restoreSupabaseSession();
      router.replace('/products');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Forgot Password', 'Enter your email above to receive a reset link.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) Alert.alert('Reset Failed', error.message);
    else Alert.alert('Check your inbox', 'We have sent you a password reset email.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
          {/* LOGO */}
          <View style={{ paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 }}>
            <Image
              source={logo}
              accessibilityLabel="App icon"
              style={{ width: '100%', height: undefined, aspectRatio: 1 }}
              resizeMode="contain"
            />
          </View>

          {/* FORM CARD */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#f9fafb',
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 24,
              marginTop: -28,
              shadowColor: COLORS.textDark,
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.textDark }}>Sign in</Text>
            <View style={{ width: 64, height: 4, backgroundColor: COLORS.primary, borderRadius: 2, marginTop: 6, marginBottom: 20 }} />

            {/* Email */}
            <Text style={{ color: COLORS.textLight, marginBottom: 8 }}>Email</Text>
            <TextInput
              placeholder="demo@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: COLORS.primary,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                backgroundColor: '#fff',
                color: COLORS.textDark,
              }}
            />

            {/* Password */}
            <Text style={{ color: COLORS.textLight, marginBottom: 8 }}>Password</Text>
            <TextInput
              placeholder="enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9ca3af"
              style={{
                borderWidth: 1,
                borderColor: COLORS.primary,
                borderRadius: 10,
                padding: 12,
                backgroundColor: '#fff',
                color: COLORS.textDark,
              }}
            />

            <Pressable onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Forgot Password?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: "#000",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 24,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </Pressable>

            {/* Register Link */}
            <View style={{ alignItems: 'center', marginTop: 18 }}>
              <Text style={{ color: COLORS.textLight }}>
                Don’t have an Account?{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '700' }} onPress={() => router.push('/register')}>
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
