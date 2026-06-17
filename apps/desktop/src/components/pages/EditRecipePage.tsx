import {
  RecipeForm,
  TagSelector,
  useNotification,
  useRecipe,
  useRecipeEditMutator
} from 'chefdeck-shared';
import { useNavigate, useParams } from 'react-router';
import { request, requestFromFormData } from '../../utils/fetchUtils';
import { useMemo } from 'react';
import FileInput from '../forms/FileInput';

export default function EditRecipePage() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const updatedRecipe = useMemo(
    () => ({
      ...recipe,
      tags: (recipe?.tags as unknown as { name: string }[])?.map(
        (tag: { name: string }) => tag.name
      )
    }),
    [recipe]
  );

  const mutator = useRecipeEditMutator(
    requestFromFormData,
    navigate,
    addNotification,
    id
  );

  return (
    <RecipeForm
      {...mutator}
      request={request}
      recipe={error || isLoading ? null : updatedRecipe}
      TagSelector={TagSelector}
      FileInput={FileInput}
    />
  );
}
