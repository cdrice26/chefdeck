import request from '@/utils/fetchUtils';
import { useState } from 'react';

export interface ProfileMutator {
  error: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Hook to manage profile mutations
 *
 * @param redirect - A function to redirect to a new page
 * @param fetchUser - A function to fetch the user data
 * @returns A profile mutator object containing:
 * - error: An optional string error message
 * - handleSubmit: A function to handle form submission
 */
const useProfileMutator = (
  redirect: (url: string) => void,
  fetchUser: () => Promise<void>
): ProfileMutator => {
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');

    const res = await request(
      '/api/auth/setupProfile',
      'POST',
      JSON.stringify({ username })
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Setup profile failed');
      return;
    }

    fetchUser();

    redirect('/dashboard');
  };

  return {
    error,
    handleSubmit
  };
};

export default useProfileMutator;
