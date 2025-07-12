'use client';

import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import request from '@/utils/fetchUtils';

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

    await fetchUser();
    router.push('/dashboard');
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1>Login</h1>
      <Input type='email' name='email' placeholder='Email' required />
      <Input type='password' name='password' placeholder='Password' required />
      <Button type='submit'>Login</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <p>
        Don&apos;t have an account?{' '}
        <a href='/signup' className='text-blue-500'>
          Sign up
        </a>
      </p>
      <p>
        <a href='/forgotPassword' className='text-blue-500'>
          Forgot Password?
        </a>
      </p>
    </ResponsiveForm>
  );
};

export default Login;
