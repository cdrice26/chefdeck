import { useAuth } from '@/context/AuthContext';
import request from '@/utils/fetchUtils';
import { useState } from 'react';

export interface Mutator {
  handleUsernameChange: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handlePasswordChange: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleUpdateEmail: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteAccount: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeConfirmPassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  usernameError: string | null;
  usernameMessage: string | null;
  passwordError: string | null;
  passwordMessage: string | null;
  emailError: string | null;
  emailMessage: string | null;
  deleteError: string | null;
  deleteMessage: string | null;
  password: string | null;
  confirmPassword: string | null;
}

const useAccountMutator = (redirect: (url: string) => void): Mutator => {
  const { fetchUser } = useAuth();

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

  const handleUsernameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');

    const response = await request(
      '/api/auth/setupProfile',
      'POST',
      JSON.stringify({ username })
    );

    if (!response.ok) {
      const errorData = await response.json();
      setUsernameError(errorData.error);
      return;
    }

    setUsernameMessage('Username updated successfully');
    setUsernameError(null);
    await fetchUser();
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

    const response = await request(
      '/api/auth/changePassword',
      'POST',
      JSON.stringify({ currentPassword, newPassword: password })
    );

    if (!response.ok) {
      const errorData = await response.json();
      setPasswordError(errorData.error);
      return;
    }

    await fetchUser();
    redirect('/');

    setPasswordMessage('Password changed successfully');
    setPasswordError(null);
  };

  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    const response = await request(
      '/api/auth/updateEmail',
      'POST',
      JSON.stringify({ email, password })
    );

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

    const response = await request(
      '/api/auth/deleteAccount',
      'POST',
      JSON.stringify({ password: confirmDelete })
    );

    if (!response.ok) {
      const errorData = await response.json();
      setDeleteError(errorData.error);
      return;
    }

    setDeleteMessage('Account deleted successfully');
    setDeleteError(null);

    await fetchUser();

    redirect('/');
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

  return {
    handleUsernameChange,
    handlePasswordChange,
    handleUpdateEmail,
    handleDeleteAccount,
    onChangePassword,
    onChangeConfirmPassword,
    usernameError,
    usernameMessage,
    passwordError,
    passwordMessage,
    emailError,
    emailMessage,
    deleteError,
    deleteMessage,
    password,
    confirmPassword
  };
};

export default useAccountMutator;
