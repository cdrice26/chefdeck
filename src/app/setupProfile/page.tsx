'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import useProfileMutator from '@/hooks/mutators/useProfileMutator';
import SetupProfile from '@/components/pages/SetupProfile';

const SetupProfilePage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);

  const { fetchUser } = useAuth();
  const mutator = useProfileMutator(router.push, fetchUser);

  return <SetupProfile {...mutator} />;
};

export default SetupProfilePage;
