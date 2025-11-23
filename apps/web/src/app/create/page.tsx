'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import useRecipeCreator from '@/hooks/mutators/useRecipeCreator';
import request from '@/utils/fetchUtils';

const CreatePage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(
    request,
    router.push,
    addNotification
  );
  return <RecipeForm request={request} handleSubmit={handleSubmit} />;
};

export default CreatePage;
