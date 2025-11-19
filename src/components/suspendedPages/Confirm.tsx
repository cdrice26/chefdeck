'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import { useNotification } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';

/**
 * Confirm component.
 *
 * Handles account confirmation and password recovery flows. It reads the query
 * parameters `token_hash`, `type`, and an optional `next` from the URL, and then
 * verifies the token by calling the backend confirmation endpoint.
 *
 * Behavior:
 * - If `type === 'recovery'`, the component shows a password reset form and uses
 *   a temporary access token returned from the backend to authorize the reset.
 * - Otherwise (e.g. account confirmation), it shows a success message, pushes a
 *   notification, and redirects to the `next` URL when verification succeeds.
 * - Errors are surfaced to the user via inline messages and the local component state.
 *
 * The component uses `Card` for layout and `Input`/`Button` for the reset form UI.
 *
 * @component
 * @returns {JSX.Element} The confirmation UI which may show status messages or a reset form.
 */
export default function Confirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useNotification();
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'reset'
  >('loading');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState('');
  const [resetError, setResetError] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
      const resp = await request(
        `/api/auth/confirm?token_hash=${encodeURIComponent(
          token_hash
        )}&type=${encodeURIComponent(type)}`,
        'GET'
      );
      const data = await resp.json();
      if (resp.ok) {
        if (type === 'recovery') {
          setStatus('reset');
          setAccessToken(data.accessToken || null);
        } else {
          setStatus('success');
          addNotification('Confirmation successful!', 'success');
          setMessage('Confirmation successful! Redirecting...');
          router.replace(next);
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ password })
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
    <div className="w-full h-full flex justify-center items-center">
      <Card className="p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto">
        {status === 'loading' && <p>Confirming...</p>}
        {status === 'success' && <p>{message}</p>}
        {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
        {status === 'reset' && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <p>Set a new password:</p>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="New password"
              required
              minLength={6}
            />
            <Button type="submit">Reset Password</Button>
            {resetError && <p className="text-red-500">{resetError}</p>}
          </form>
        )}
      </Card>
    </div>
  );
}
