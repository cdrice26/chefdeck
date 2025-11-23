import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import { ProfileMutator } from '@/hooks/mutators/useProfileMutator';

const SetupProfile = ({ handleSubmit, error }: ProfileMutator) => (
  <ResponsiveForm onSubmit={handleSubmit}>
    <h1>Setup Profile</h1>
    <Input type="text" name="username" placeholder="Username" required />
    <Button type="submit">Save</Button>
    {error && <div style={{ color: 'red' }}>{error}</div>}
  </ResponsiveForm>
);

export default SetupProfile;
