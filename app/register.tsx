import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
const appConfig = require('../app.json');

const ACCENT =
  (appConfig?.expo?.android?.adaptiveIcon?.backgroundColor) ||
  appConfig?.expo?.iconBackgroundColor ||
  '#618000'; // same as login green tone

const logo = require('../assets/images/icon.png');

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
    }

    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5efe4" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: 40,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={logo}
              style={{ width: 120, height: 120, resizeMode: 'contain' }}
            />
          </View>

          {/* Form Section */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Create Account
            </Text>

            {error ? (
              <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text>
            ) : null}
            {success ? (
              <Text style={{ color: 'green', marginBottom: 10, textAlign: 'center' }}>{success}</Text>
            ) : null}

            {/* Full Name */}
            <Text style={{ color: '#6b7280', marginBottom: 6 }}>Full Name</Text>
            <TextInput
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f9fafb',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Contact Number */}
            <Text style={{ color: '#6b7280', marginBottom: 6 }}>Contact Number</Text>
            <TextInput
              placeholder="e.g. +91 98765 43210"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f9fafb',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Address */}
            <Text style={{ color: '#6b7280', marginBottom: 6 }}>Address</Text>
            <TextInput
              placeholder="Street, City, State"
              value={address}
              onChangeText={setAddress}
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f9fafb',
                minHeight: 60,
                textAlignVertical: 'top',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Email */}
            <Text style={{ color: '#6b7280', marginBottom: 6 }}>Email</Text>
            <TextInput
              placeholder="demo@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f9fafb',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Password */}
            <Text style={{ color: '#6b7280', marginBottom: 6 }}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 10,
                padding: 12,
                backgroundColor: '#f9fafb',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={{
                backgroundColor: "#000",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 20,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                {loading ? 'Creating Account...' : 'Register'}
              </Text>
            </Pressable>

            {/* Login Redirect */}
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: '#6b7280' }}>
                Already have an account?{' '}
                <Text
                  style={{ color: ACCENT, fontWeight: '700' }}
                  onPress={() => router.push('/')}
                >
                  Login
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
