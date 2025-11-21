import { PasswordMutator } from '@/hooks/usePasswordMutator';
import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import ResponsiveForm from '@/components/forms/ResponsiveForm';

const ForgotPassword: React.FC<PasswordMutator> = ({
  handleSubmit,
  error,
  message
}: PasswordMutator) => (
  <ResponsiveForm onSubmit={handleSubmit}>
    <h1>Forgot Password</h1>
    <Input type="email" name="email" placeholder="Email" required />

    <Button type="submit">Reset Password</Button>
    {error && <div style={{ color: 'red' }}>{error}</div>}
    {message && <div style={{ color: 'green' }}>{message}</div>}
  </ResponsiveForm>
);

export default ForgotPassword;
