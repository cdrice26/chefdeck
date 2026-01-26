'use client';

import { useRouter } from 'next/navigation';
import { useLoginMutator, Login } from 'chefdeck-shared';
import request from '@/utils/fetchUtils';

const LoginPage = () => {
  const router = useRouter();
  const mutator = useLoginMutator(request, router.push);

  return <Login {...mutator} />;
};

export default LoginPage;
