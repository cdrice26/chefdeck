import { LoginMutator } from '@/hooks/mutators/useLoginMutator';
import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import ResponsiveForm from '@/components/forms/ResponsiveForm';

interface LoginProps extends LoginMutator {
  hideLinks?: boolean;
}

const Login = ({ error, handleSubmit, hideLinks }: LoginProps) => (
  <ResponsiveForm onSubmit={handleSubmit}>
    <h1>Login</h1>
    <Input type="email" name="email" placeholder="Email" required />
    <Input type="password" name="password" placeholder="Password" required />
    <Button type="submit">Login</Button>
    {error && <div style={{ color: 'red' }}>{error}</div>}
    {!hideLinks && (
      <>
        <p>
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-500">
            Sign up
          </a>
        </p>
        <p>
          <a href="/forgotPassword" className="text-blue-500">
            Forgot Password?
          </a>
        </p>
      </>
    )}
  </ResponsiveForm>
);

export default Login;
