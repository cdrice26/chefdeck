'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';

/**
 * Signup component renders a user registration form.
 * Handles user input, password confirmation, and form submission to the signup API.
 * Displays error messages for invalid input or failed signup attempts.
 *
 * @component
 * @returns {JSX.Element} The rendered signup form.
 */
const Signup = () => {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  /**
   * Handles the signup form submission.
   * Validates password confirmation and sends signup data to the API.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Signup failed');
      return;
    }

    router.push('/');
  };

  /**
   * Handles changes to the password input field.
   * Updates password state and validates password match.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError(null);
    }
  };

  /**
   * Handles changes to the confirm password input field.
   * Updates confirmPassword state and validates password match.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setError('Passwords do not match');
    } else {
      setError(null);
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSignup}>
      <h1>Sign Up</h1>
      <Input type='email' name='email' placeholder='Email' required />
      <Input
        type='password'
        name='password'
        placeholder='Password'
        required
        value={password}
        onChange={handlePasswordChange}
      />
      <Input
        type='password'
        name='confirmPassword'
        placeholder='Confirm Password'
        required
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
      />
      <Button type='submit'>Sign Up</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </ResponsiveForm>
  );
};

export default Signup;
