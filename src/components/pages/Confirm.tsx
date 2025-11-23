import { ConfirmActions } from '@/hooks/useConfirmActions';
import Button from '../forms/Button';
import Input from '../forms/Input';
import Card from '../ui/Card';

const Confirm = ({
  status,
  message,
  handleReset,
  resetError,
  setPassword,
  password
}: ConfirmActions) => (
  <div className="w-full h-full flex justify-center items-center">
    <Card className="p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto">
      {status === 'loading' && <p>Confirming...</p>}
      {status === 'success' && <p>{message}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
      {status === 'reset' && (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <p>Set a new password:</p>
          <Input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="New password"
            required
            minLength={6}
          />
          <Button type="submit">Reset Password</Button>
          {resetError && <p className="text-red-500">{resetError}</p>}
        </form>
      )}
    </Card>
  </div>
);

export default Confirm;
