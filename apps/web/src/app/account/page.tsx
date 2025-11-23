'use client';

import Account from '@/components/pages/Account';
import useAccountMutator from '@/hooks/mutators/useAccountMutator';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import request from '@/utils/fetchUtils';

const AccountPage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);

  const { fetchUser } = useAuth();

  const mutator = useAccountMutator(request, router.push, fetchUser);

  return <Account {...mutator} />;
};

export default AccountPage;
