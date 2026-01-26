'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import useProfileMutator from '@/hooks/mutators/useProfileMutator';
import SetupProfile from '@/components/pages/SetupProfile';
import request from '@/utils/fetchUtils';

const SetupProfilePage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);

  const { fetchUser } = useAuth();
  const mutator = useProfileMutator(request, router.push, fetchUser);

  return <SetupProfile {...mutator} />;
};

export default SetupProfilePage;
