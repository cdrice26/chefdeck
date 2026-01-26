import { SignupMutator } from '@/hooks/mutators/useSignupMutator';
import { ResponsiveForm, Input, Button } from 'chefdeck-shared';

const SignUp = ({
  password,
  confirmPassword,
  error,
  handleSignup,
  onChangePassword,
  onChangeConfirmPassword
}: SignupMutator) => (
  <ResponsiveForm onSubmit={handleSignup}>
    <h1>Sign Up</h1>
    <Input type="email" name="email" placeholder="Email" required />
    <Input
      type="password"
      name="password"
      placeholder="Password"
      required
      value={password}
      onChange={onChangePassword}
    />
    <Input
      type="password"
      name="confirmPassword"
      placeholder="Confirm Password"
      required
      value={confirmPassword}
      onChange={onChangeConfirmPassword}
    />
    <Button type="submit">Sign Up</Button>
    {error && <div style={{ color: 'red' }}>{error}</div>}
  </ResponsiveForm>
);

export default SignUp;
