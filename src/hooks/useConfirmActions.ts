import { NotificationKind } from '@/context/NotificationContext';
import RequestFn from '@/types/RequestFn';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface ConfirmActions {
  status: 'loading' | 'success' | 'error' | 'reset';
  message: string;
  handleReset: (e: React.FormEvent) => Promise<void>;
  resetError: string;
  setPassword: (password: string) => void;
  password: string;
}

/**
 * Hook for handling confirmation code actions.
 *
 * Handles account confirmation and password recovery flows. It reads the query
 * parameters `token_hash`, `type`, and an optional `next` from the URL, and then
 * verifies the token by calling the backend confirmation endpoint.
 *
 * Behavior:
 * - If `type === 'recovery'`, verifyToken sets status to 'reset' and password to an empty string,
 *   returning both to the component. Otherwise, it redirects to the `next` URL when verification succeeds.
 *
 * @param request
 * @param redirect
 * @param addNotification
 * @param searchParams
 * @returns
 */
const useConfirmActions = (
  request: RequestFn,
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void,
  searchParams: ReadonlyURLSearchParams
): ConfirmActions => {
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
          redirect(next);
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
  }, [token_hash, type, next]);

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
      setTimeout(() => redirect('/login'), 2000);
    } else {
      setStatus('reset');
      setResetError(data.error || 'Failed to reset password.');
    }
  };

  return { status, message, handleReset, resetError, password, setPassword };
};

export default useConfirmActions;
