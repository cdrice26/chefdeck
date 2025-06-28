import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';

export default function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('/api/auth/checkAuth', 'GET');
      if (!res.ok) {
        router.replace('/login');
      }
      const json = await res.json();
      const username = json?.data?.profile?.username;
      if (!username) {
        router.replace('/setupProfile');
      }
    };
    checkAuth();
  }, [router]);
}
