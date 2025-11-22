import { useState } from 'react';
import usePasswordValidator from '../validators/usePasswordValidator';
import request from '@/utils/fetchUtils';

export interface SignupMutator {
  error: string | null;
  password: string;
  confirmPassword: string;
  handleSignup: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeConfirmPassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Hook for handling user signup
 *
 * @param redirect - A function to redirect to a new URL
 * @returns
 */
const useSignupMutator = (redirect: (url: string) => void): SignupMutator => {
  const [error, setError] = useState<string | null>(null);

  const {
    password,
    confirmPassword,
    onChangePassword,
    onChangeConfirmPassword
  } = usePasswordValidator(setError);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const res = await request(
      '/api/auth/signup',
      'POST',
      JSON.stringify({ email, password, confirmPassword })
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Signup failed');
      return;
    }

    redirect('/');
  };

  return {
    error,
    password,
    confirmPassword,
    handleSignup,
    onChangePassword,
    onChangeConfirmPassword
  };
};

export default useSignupMutator;
