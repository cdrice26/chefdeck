import { useState } from 'react';

export interface PasswordValidator {
  password: string;
  confirmPassword: string;
  onChangePassword: (e: React.FormEvent<HTMLInputElement>) => void;
  onChangeConfirmPassword: (e: React.FormEvent<HTMLInputElement>) => void;
}

/**
 * A hook for validating passwords.
 *
 * @returns An object containing the following:
 * - password: The password entered by the user.
 * - confirmPassword: The confirm password entered by the user.
 * - onChangePassword: A function to handle password changes.
 * - onChangeConfirmPassword: A function to handle confirm password changes.
 */
const usePasswordValidator = (
  setPasswordError: React.Dispatch<React.SetStateAction<string | null>>
): PasswordValidator => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    onChangePassword,
    onChangeConfirmPassword,
    password,
    confirmPassword
  };
};

export default usePasswordValidator;
