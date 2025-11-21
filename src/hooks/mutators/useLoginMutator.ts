import request from '@/utils/fetchUtils';
import { useState } from 'react';

export interface LoginMutator {
  error: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const useLoginMutator = (redirect: (url: string) => void) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const res = await request(
      '/api/auth/login',
      'POST',
      JSON.stringify({ email, password })
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      return;
    }

    redirect('/dashboard');
  };

  return {
    error,
    handleSubmit
  };
};

export default useLoginMutator;
