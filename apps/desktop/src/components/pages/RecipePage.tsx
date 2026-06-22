'use client';

import { useParams, useNavigate } from 'react-router';
import { request } from '../../utils/fetchUtils';
import {
  useRecipe,
  useNotification,
  RecipeDetails,
  useRecipeMutator,
  Recipe
} from 'cookycardz-shared';
import { confirm } from '@tauri-apps/plugin-dialog';
import { useMemo } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useOpener } from '../../hooks/useOpener';
import usePrinter from '../../hooks/usePrinter';

export default function RecipePage() {
  const navigate = useNavigate();
  useOpener();

  const { id } = useParams() as { id: string };

  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const updatedRecipe = useMemo(
    () => ({
      ...recipe,
      imgUrl:
        recipe?.imgUrl !== null && recipe?.imgUrl !== undefined
          ? convertFileSrc(recipe?.imgUrl)
          : null,
      tags: (recipe?.tags as unknown as { name: string }[])?.map(
        (tag: { name: string }) => tag.name
      )
    }),
    [recipe]
  );

  const handlePrint = usePrinter(
    addNotification,
    <RecipeDetails
      recipe={{ ...updatedRecipe, tags: [] }}
      error={null}
      isLoading={false}
    />,
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
