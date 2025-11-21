'use client';

import { useRouter } from 'next/navigation';
import useLoginMutator from '@/hooks/mutators/useLoginMutator';
import Login from '@/components/pages/Login';

const LoginPage = () => {
  const router = useRouter();
  const mutator = useLoginMutator(router.push);

  return <Login {...mutator} />;
};

export default LoginPage;
