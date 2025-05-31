'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import Card from '@/components/ui/Card';
import { useState } from 'react';

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    const res = await fetch('/api/auth/forgotPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

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
    <div className='w-full h-full flex justify-center items-center'>
      <Card className='p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <h1>Forgot Password</h1>
          <Input type='email' name='email' placeholder='Email' required />

          <Button type='submit'>Reset Password</Button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {message && <div style={{ color: 'green' }}>{message}</div>}
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
