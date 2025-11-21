'use client';

import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import request from '@/utils/fetchUtils';
import useRequireAuth from '@/hooks/useRequireAuth';

/**
 * Login page component.
 *
 * Renders a login form that allows users to sign in with their email and password.
 * On successful login, the user is redirected to the home page.
 * Displays error messages if authentication fails.
 *
 * @component
 * @returns {JSX.Element} The rendered login page.
 */
const Login = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
  const [error, setError] = useState<string | null>(null);
  const { fetchUser } = useAuth();

  /**
   * Handles form submission for user login.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
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

    router.push('/dashboard');
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1>Setup Profile</h1>
      <Input type="text" name="username" placeholder="Username" required />
      <Button type="submit">Save</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </ResponsiveForm>
  );
};

export default Login;
