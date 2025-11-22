'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/fetchers/useRecipe';
import useRecipeEditMutator from '@/hooks/mutators/useRecipeEditMutator';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useParams, useRouter } from 'next/navigation';

export default function EditRecipePage() {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { id } = useParams() as { id: string };
  const { recipe, isLoading, error } = useRecipe(id as string);
  const { addNotification } = useNotification();

  const mutator = useRecipeEditMutator(router.push, addNotification, id);

  return (
    <RecipeForm {...mutator} recipe={error || isLoading ? null : recipe} />
  );
}
