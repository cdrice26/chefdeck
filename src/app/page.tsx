'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/auth/checkAuth', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data?.data?.user) {
        router.replace('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return <div>Cooky</div>;
}
