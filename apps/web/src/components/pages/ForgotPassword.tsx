import { PasswordMutator } from '@/hooks/mutators/usePasswordMutator';
import { ResponsiveForm, Input, Button } from 'chefdeck-shared';


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
