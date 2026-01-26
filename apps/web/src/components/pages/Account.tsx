import { Input, Button } from 'chefdeck-shared';
import Section from '@/components/AccountSection';
import { Mutator } from '@/hooks/mutators/useAccountMutator';

const Account = ({
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
}: Mutator) => (
  <div className="flex flex-col gap-4 items-center min-h-screen p-4">
    <h1 className="text-2xl font-bold">My Account</h1>
    <Section name="Update Username" onFormSubmit={handleUsernameChange}>
      <Input name="username" placeholder="Username" />
      {usernameError && <p className="text-red-500">{usernameError}</p>}
      {usernameMessage && <p className="text-green-500">{usernameMessage}</p>}
      <Button type="submit">Update</Button>
    </Section>
    <Section name="Change Password" onFormSubmit={handlePasswordChange}>
      <Input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
      />
      <Input
        type="password"
        name="newPassword"
        onChange={onChangePassword}
        value={password ?? ''}
        placeholder="New Password"
      />
      <Input
        type="password"
        name="confirmPassword"
        onChange={onChangeConfirmPassword}
        value={confirmPassword ?? ''}
        placeholder="Confirm New Password"
      />
      {passwordError && <p className="text-red-500">{passwordError}</p>}
      {passwordMessage && <p className="text-green-500">{passwordMessage}</p>}
      <Button type="submit">Change Password</Button>
    </Section>
    <Section name="Update Email" onFormSubmit={handleUpdateEmail}>
      <Input name="password" type="password" placeholder="Password" />
      <Input name="email" type="email" placeholder="Email" />
      {emailError && <p className="text-red-500">{emailError}</p>}
      {emailMessage && <p className="text-green-500">{emailMessage}</p>}
      <Button type="submit">Update Email</Button>
    </Section>
    <Section name="Delete Account" onFormSubmit={handleDeleteAccount}>
      Deleting your account is permanent and cannot be undone. Please confirm
      your password to proceed.
      <Input
        type="password"
        name="confirmDelete"
        placeholder="Type your password to confirm"
      />
      {deleteError && <p className="text-red-500">{deleteError}</p>}
      {deleteMessage && <p className="text-green-500">{deleteMessage}</p>}
      <Button type="submit">Delete Account</Button>
    </Section>
  </div>
);

export default Account;
