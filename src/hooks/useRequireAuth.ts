import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import request from '@/utils/fetchUtils';

export default function useRequireAuth() {
  const router = useRouter();
  const { setUser, setUsername } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('/api/auth/checkAuth', 'GET');
      if (!res.ok) {
        router.replace('/login');
        return;
      }
      const json = await res.json();
      setUser(json.data.user);
      setUsername(json.data.profile?.username ?? null);
      const username = json?.data?.profile?.username;
      if (!username) {
        router.replace('/setupProfile');
      }
    };
    checkAuth();
  }, [router]);
}
