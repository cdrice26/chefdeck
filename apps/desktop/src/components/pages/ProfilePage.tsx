import { Button, Login, useLoginMutator } from 'chefdeck-shared';
import { useAuth } from '../../hooks/useAuth';
import { request } from '../../utils/fetchUtils';
import { useNavigate } from 'react-router';

export default function ProfilePage() {
  const { username, fetchUser } = useAuth();
  const navigate = useNavigate();
  const { error, handleSubmit } = useLoginMutator(request, navigate);

  if (username) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl">
          Cloud syncing is enabled with username {username}.
        </h1>
        <Button
          onClick={async () => {
            const resp = await request('/api/auth/logout', 'POST');
            if (resp.ok) {
              navigate('/');
              await fetchUser();
            }
          }}
          className="mt-4"
        >
          Logout
        </Button>
      </div>
    );
  } else {
    return (
      <>
        <h1 className="text-2xl flex items-center justify-center">
          Sign in to ChefDeck to enable cloud syncing.
        </h1>
        <Login
          error={error}
          handleSubmit={async (e) => {
            await handleSubmit(e);
            await fetchUser();
          }}
          hideLinks={true}
        />
      </>
    );
  }
}
