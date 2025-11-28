'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import {useRecipeCreator, useNotification, RecipeForm} from 'chefdeck-shared';
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
