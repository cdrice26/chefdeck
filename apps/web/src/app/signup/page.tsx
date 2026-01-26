'use client';

import { useRouter } from 'next/navigation';
import useSignupMutator from '@/hooks/mutators/useSignupMutator';
import SignUp from '@/components/pages/SignUp';
import request from '@/utils/fetchUtils';

const SignupPage = () => {
  const router = useRouter();
  const mutator = useSignupMutator(request, router.push);

  return <SignUp {...mutator} />;
};

export default SignupPage;
