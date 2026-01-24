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
import { confirm } from '@tauri-apps/plugin-dialog';
import { useMemo } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';

export default function RecipePage() {
  const navigate = useNavigate();

  const { id } = useParams() as { id: string };

  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const updatedRecipe = useMemo(
    () => ({
      ...recipe,
      imgUrl:
        recipe?.imgUrl !== null && recipe?.imgUrl !== undefined
          ? convertFileSrc(recipe?.imgUrl)
          : null
    }),
    [recipe]
  );

  const handlePrint = usePrinter(
    addNotification,
    <RecipeDetails recipe={recipe} error={null} isLoading={false} />,
    'Print Recipe'
  );

  const mutator = useRecipeMutator(
    request,
    navigate,
    addNotification,
    id,
    confirm
  );

  return (
    <Recipe
      {...mutator}
      handlePrint={handlePrint}
      recipe={updatedRecipe}
      isLoading={isLoading}
      error={error}
    />
  );
}
