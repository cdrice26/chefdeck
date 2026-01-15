import { useEffect, useState } from 'react';
import { request } from '../utils/fetchUtils';

export const useAuth = () => {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const resp = await request('/api/auth/checkAuth', 'GET');
      if (resp.ok) {
        const json = await resp.json();
        setUsername((json as any)?.data?.profile?.username);
      } else {
        setUsername(null);
      }
    })();
  }, []);
  return username;
};
