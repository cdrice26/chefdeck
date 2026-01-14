import { Login, useLoginMutator } from 'chefdeck-shared';
import { useAuth } from '../../hooks/useAuth';
import { request } from '../../utils/fetchUtils';
import { useNavigate } from 'react-router';

export default function ProfilePage() {
  const username = useAuth();
  const navigate = useNavigate();
  const loginMutator = useLoginMutator(request, navigate);

  if (username) {
    return (
      <div>
        <h1>Profile Page</h1>
        <p>Welcome, {username}!</p>
      </div>
    );
  } else {
    return <Login {...loginMutator} hideLinks={true} />;
  }
}
