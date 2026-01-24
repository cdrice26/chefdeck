'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import { useParams, useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';
import {
  useRecipe,
  useNotification,
  usePrinter,
  RecipeDetails,
  useRecipeMutator,
  Recipe
} from 'chefdeck-shared';

export default function RecipePage() {
  const router = useRouter();
  useRequireAuth(request, router.replace);

  const { id } = useParams() as { id: string };

  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const handlePrint = usePrinter(
    addNotification,
    <RecipeDetails recipe={recipe} error={null} isLoading={false} />,
    'Print Recipe'
  );

  const mutator = useRecipeMutator(
    request,
    router.push,
    addNotification,
    id,
    (message: string) => Promise.resolve(window.confirm(message))
  );

  return (
    <Recipe
      {...mutator}
      handlePrint={handlePrint}
      recipe={recipe}
      isLoading={isLoading}
      error={error}
    />
  );
}
