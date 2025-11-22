import RequestFn from '@/types/RequestFn';
import { useState } from 'react';

export interface PasswordMutator {
  error: string | null;
  message: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * A hook for managing password forget mutation operations.
 *
 * @param request - A function that makes a request to the server.
 * @returns An object containing the following properties:
 *  - error: A string containing an error message, or null if no error occurred.
 *  - message: A string containing a success message, or null if no message was set.
 *  - handleSubmit: A function that handles form submission and updates the error and message states.
 */
const usePasswordMutator = (request: RequestFn): PasswordMutator => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    const res = await request(
      '/api/auth/forgotPassword',
      'POST',
      JSON.stringify({ email })
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Password reset failed');
      return;
    }

    setMessage(
      'Password reset email sent successfully. Please check your inbox.'
    );
  };

  return {
    error,
    message,
    handleSubmit
  };
};

export default usePasswordMutator;
