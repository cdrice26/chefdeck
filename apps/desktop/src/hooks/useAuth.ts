import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    setUsername(null);
  }, []);
  return username;
};
