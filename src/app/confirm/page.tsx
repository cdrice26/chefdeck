'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'reset'
  >('loading');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState('');
  const [resetError, setResetError] = useState<string>('');

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  const verifyToken = async () => {
    if (!token_hash || !type) {
      setStatus('error');
      setMessage('Invalid or missing confirmation parameters.');
      return;
    }

    try {
      const resp = await fetch(
        `/api/auth/confirm?token_hash=${encodeURIComponent(
          token_hash
        )}&type=${encodeURIComponent(type)}`
      );
      const data = await resp.json();
      if (resp.ok) {
        if (type === 'recovery') {
          setStatus('reset');
        } else {
          setStatus('success');
          setMessage(data.message || 'Confirmation successful!');
          setTimeout(() => router.replace(next), 2000);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Confirmation failed.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during confirmation.');
    }
  };

  useEffect(() => {
    // Verify token on mount
    verifyToken();
  }, [token_hash, type, next, router]);

  // Handle password reset form submit
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setStatus('loading');
    const res = await fetch('/api/auth/resetPassword', {
      method: 'POST',
      body: JSON.stringify({ token_hash, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage('Password reset! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setStatus('reset');
      setResetError(data.error || 'Failed to reset password.');
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <Card className='p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto'>
        {status === 'loading' && <p>Confirming...</p>}
        {status === 'success' && <p>{message}</p>}
        {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
        {status === 'reset' && (
          <form onSubmit={handleReset} className='flex flex-col gap-4'>
            <p>Set a new password:</p>
            <Input
              type='password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder='New password'
              required
              minLength={6}
            />
            <Button type='submit'>Reset Password</Button>
            {resetError && <p className='text-red-500'>{resetError}</p>}
          </form>
        )}
      </Card>
    </div>
  );
}
