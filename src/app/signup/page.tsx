'use client';

import { useRouter } from 'next/navigation';
import useSignupMutator from '@/hooks/mutators/useSignupMutator';
import SignUp from '@/components/pages/SignUp';

const SignupPage = () => {
  const router = useRouter();
  const mutator = useSignupMutator(router.push);

  return <SignUp {...mutator} />;
};

export default SignupPage;
