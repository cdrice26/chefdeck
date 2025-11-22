import { useState } from 'react';
import usePasswordValidator from '../validators/usePasswordValidator';
import RequestFn from '@/types/RequestFn';

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
 * @param request - A function to make HTTP requests
 * @param redirect - A function to redirect to a new URL
 * @returns An object containing the following properties:
 * - error: A string or null representing the error message
 * - password: A string representing the password input value
 * - confirmPassword: A string representing the confirm password input value
 * - handleSignup: A function to handle the signup form submission
 * - onChangePassword: A function to handle password input change
 * - onChangeConfirmPassword: A function to handle confirm password input change
 */
const useSignupMutator = (
  request: RequestFn,
  redirect: (url: string) => void
): SignupMutator => {
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
