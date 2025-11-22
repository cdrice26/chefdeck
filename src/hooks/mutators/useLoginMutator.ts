import RequestFn from '@/types/RequestFn';
import { useState } from 'react';

export interface LoginMutator {
  error: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Hook for handling login mutations.
 *
 * @param request - A function to make HTTP requests
 * @param redirect - Function to redirect to new URL
 * @returns An object with the following properties:
 * - error: string | null - Error message or null if no error
 * - handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> - Function to handle form submission
 */
const useLoginMutator = (
  request: RequestFn,
  redirect: (url: string) => void
) => {
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
