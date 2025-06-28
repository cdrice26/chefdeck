'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('/api/auth/checkAuth', 'GET');
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
