'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface SectionProps {
  children: React.ReactNode;
  name: string;
  onFormSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Section = ({ children, name, onFormSubmit }: SectionProps) => (
  <Card className='w-[95%] sm:w-1/2 p-4 flex flex-col gap-4'>
    <h1 className='text-xl font-semibold'>{name}</h1>
    <form className='flex flex-col gap-4' onSubmit={onFormSubmit}>
      {children}
    </form>
  </Card>
);

const AccountPage = () => {
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const [password, setPassword] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string | null>(null);

  const { fetchUser } = useAuth();

  const handleUsernameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');

    const response = await fetch('/api/auth/setupProfile', {
      method: 'POST',
      body: JSON.stringify({ username }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      setUsernameError(errorData.error);
      return;
    }

    setUsernameMessage('Username updated successfully');
    setUsernameError(null);
    await fetchUser();
  };

  const onChangePassword = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
    if (
      e.currentTarget.value !== confirmPassword &&
      e.currentTarget.value !== '' &&
      confirmPassword !== ''
    ) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError(null);
    }
  };

  const onChangeConfirmPassword = (e: React.FormEvent<HTMLInputElement>) => {
    setConfirmPassword(e.currentTarget.value);
    if (
      e.currentTarget.value !== password &&
      e.currentTarget.value !== '' &&
      password !== ''
    ) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;

    if (!password || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const response = await fetch('/api/auth/changePassword', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword: password }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      setPasswordError(errorData.error);
      return;
    }

    setPasswordMessage('Password changed successfully');
    setPasswordError(null);
  };

  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    const response = await fetch('/api/auth/updateEmail', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      setEmailError(errorData.error);
      return;
    }

    setEmailMessage(
      'Emails were sent to both old and new addresses for verification. Upon verification, your email will be updated and you must use the new email to log in.'
    );
    await fetchUser();
    setEmailError(null);
  };

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const confirmDelete = formData.get('confirmDelete') as string;

    if (!confirmDelete) {
      setDeleteError('Please confirm your password to delete your account');
      return;
    }

    const response = await fetch('/api/auth/deleteAccount', {
      method: 'POST',
      body: JSON.stringify({ password: confirmDelete }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      setDeleteError(errorData.error);
      return;
    }

    setDeleteMessage('Account deleted successfully');
    setDeleteError(null);

    await fetchUser();
  };

  return (
    <div className='flex flex-col gap-4 items-center min-h-screen p-4'>
      <h1 className='text-2xl font-bold'>My Account</h1>
      <Section name='Update Username' onFormSubmit={handleUsernameChange}>
        <Input name='username' placeholder='Username' />
        {usernameError && <p className='text-red-500'>{usernameError}</p>}
        {usernameMessage && <p className='text-green-500'>{usernameMessage}</p>}
        <Button type='submit'>Update</Button>
      </Section>
      <Section name='Change Password' onFormSubmit={handlePasswordChange}>
        <Input
          type='password'
          name='currentPassword'
          placeholder='Current Password'
        />
        <Input
          type='password'
          name='newPassword'
          onChange={onChangePassword}
          value={password ?? ''}
          placeholder='New Password'
        />
        <Input
          type='password'
          name='confirmPassword'
          onChange={onChangeConfirmPassword}
          value={confirmPassword ?? ''}
          placeholder='Confirm New Password'
        />
        {passwordError && <p className='text-red-500'>{passwordError}</p>}
        {passwordMessage && <p className='text-green-500'>{passwordMessage}</p>}
        <Button type='submit'>Change Password</Button>
      </Section>
      <Section name='Update Email' onFormSubmit={handleUpdateEmail}>
        <Input name='email' placeholder='Email' />
        {emailError && <p className='text-red-500'>{emailError}</p>}
        {emailMessage && <p className='text-green-500'>{emailMessage}</p>}
        <Button type='submit'>Update Email</Button>
      </Section>
      <Section name='Delete Account' onFormSubmit={handleDeleteAccount}>
        Deleting your account is permanent and cannot be undone. Please confirm
        your password to proceed.
        <Input
          type='password'
          name='confirmDelete'
          placeholder='Type your password to confirm'
        />
        {deleteError && <p className='text-red-500'>{deleteError}</p>}
        {deleteMessage && <p className='text-green-500'>{deleteMessage}</p>}
        <Button type='submit'>Delete Account</Button>
      </Section>
    </div>
  );
};

export default AccountPage;
