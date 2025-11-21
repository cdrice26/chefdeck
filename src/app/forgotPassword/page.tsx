'use client';

import ForgotPassword from '@/components/pages/ForgotPassword';
import usePasswordMutator from '@/hooks/usePasswordMutator';

const ForgotPasswordPage = () => {
  const mutator = usePasswordMutator();

  return <ForgotPassword {...mutator} />;
};

export default ForgotPasswordPage;
