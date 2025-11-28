'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useRecipe, useNotification, useRecipeEditMutator, RecipeForm } from 'chefdeck-shared';
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
