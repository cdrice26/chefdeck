'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import request from '@/utils/fetchUtils';
import { useState } from 'react';

const ForgotPassword = () => {
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

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1>Forgot Password</h1>
      <Input type='email' name='email' placeholder='Email' required />

      <Button type='submit'>Reset Password</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
    </ResponsiveForm>
  );
};

export default ForgotPassword;
