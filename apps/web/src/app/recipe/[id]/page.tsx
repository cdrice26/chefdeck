'use client';

import RecipeDetails from '@/components/recipe/RecipeDetails';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/fetchers/useRecipe';
import useRequireAuth from '@/hooks/useRequireAuth';
import usePrinter from '@/hooks/usePrinter';
import { useParams, useRouter } from 'next/navigation';
import useRecipeMutator from '@/hooks/mutators/useRecipeMutator';
import Recipe from '@/components/pages/Recipe';
import request from '@/utils/fetchUtils';

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

  const mutator = useRecipeMutator(request, router.push, addNotification, id);

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
