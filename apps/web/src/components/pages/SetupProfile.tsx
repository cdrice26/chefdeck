import { ProfileMutator } from '@/hooks/mutators/useProfileMutator';
import { ResponsiveForm, Input, Button } from 'chefdeck-shared';

const SetupProfile = ({ handleSubmit, error }: ProfileMutator) => (
  <ResponsiveForm onSubmit={handleSubmit}>
    <h1>Setup Profile</h1>
    <Input type="text" name="username" placeholder="Username" required />
    <Button type="submit">Save</Button>
    {error && <div style={{ color: 'red' }}>{error}</div>}
  </ResponsiveForm>
);

export default SetupProfile;
