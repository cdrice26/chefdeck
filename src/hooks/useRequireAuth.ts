import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.replace('/login');
        return;
      }
      const res = await fetch('/api/auth/checkAuth', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
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
