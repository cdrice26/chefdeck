'use client';

import Account from '@/components/pages/Account';
import useAccountMutator from '@/hooks/useAccountMutator';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';

const AccountPage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);

  const mutator = useAccountMutator(router.push);

  return <Account {...mutator} />;
};

export default AccountPage;
