'use client';

import ForgotPassword from '@/components/pages/ForgotPassword';
import usePasswordMutator from '@/hooks/mutators/usePasswordMutator';
import request from '@/utils/fetchUtils';

const ForgotPasswordPage = () => {
  const mutator = usePasswordMutator(request);

  return <ForgotPassword {...mutator} />;
};

export default ForgotPasswordPage;
