import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getItem } from '../lib/mmkv';

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
      // Delay navigation so Root Layout and Slot mount first
      const t = setTimeout(() => {
        router.replace('/products');
      }, 50);
      return () => clearTimeout(t);
    }else{
      router.replace('/login');
    }
  }, [router]);
}
