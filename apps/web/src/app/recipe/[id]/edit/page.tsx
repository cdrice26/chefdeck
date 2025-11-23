'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/fetchers/useRecipe';
import useRecipeEditMutator from '@/hooks/mutators/useRecipeEditMutator';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useParams, useRouter } from 'next/navigation';

export default function EditRecipePage() {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { id } = useParams() as { id: string };
  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const mutator = useRecipeEditMutator(
    request,
    router.push,
    addNotification,
    id
  );

  return (
    <RecipeForm
      {...mutator}
      request={request}
      recipe={error || isLoading ? null : recipe}
    />
  );
}
