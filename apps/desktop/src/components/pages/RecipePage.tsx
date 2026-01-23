'use client';

import { useParams, useNavigate } from 'react-router';
import { request } from '../../utils/fetchUtils';
import {
  useRecipe,
  useNotification,
  usePrinter,
  RecipeDetails,
  useRecipeMutator,
  Recipe
} from 'chefdeck-shared';

export default function RecipePage() {
  const navigate = useNavigate();

  const { id } = useParams() as { id: string };

  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const handlePrint = usePrinter(
    addNotification,
    <RecipeDetails recipe={recipe} error={null} isLoading={false} />,
    'Print Recipe'
  );

  const mutator = useRecipeMutator(request, navigate, addNotification, id);

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
