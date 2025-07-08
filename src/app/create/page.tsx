'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Button from '@/components/forms/Button';

const CreatePage = () => {
  const router = useRouter();
  useRequireAuth();

  return (
    <ResponsiveForm onSubmit={() => {}}>
      <h1 className='font-bold text-2xl'>New Recipe</h1>
      <Button onClick={() => router.push('/create/manual')}>
        Manual Entry
      </Button>
      <Button onClick={() => router.push('/create/fromWeb')}>From URL</Button>
    </ResponsiveForm>
  );
};

export default CreatePage;
