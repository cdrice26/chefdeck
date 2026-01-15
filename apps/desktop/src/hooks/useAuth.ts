import { useEffect, useState } from 'react';
import { request } from '../utils/fetchUtils';

interface UserResponse {
  data: {
    profile: {
      username: string;
    };
  };
}

export const useAuth = () => {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const resp = await request('/api/auth/checkAuth', 'GET');
      if (resp.ok) {
        const json = await resp.json();
        setUsername((json as UserResponse)?.data?.profile?.username);
      } else {
        setUsername(null);
      }
    })();
  }, []);
  return username;
};
