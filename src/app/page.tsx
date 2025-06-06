'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const redirectToDasboard = async () => {
    await fetchUser();
    if (user) {
      router.push('/dashboard');
    }
  };

  const router = useRouter();
  const { fetchUser, user } = useAuth();

  useEffect(() => {
    redirectToDasboard();
  });

  return <div>Cooky</div>;
}
