'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import useRecipeCreator from '@/hooks/mutators/useRecipeCreator';

const CreatePage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(router.push, addNotification);
  return <RecipeForm handleSubmit={handleSubmit} />;
};

export default CreatePage;
