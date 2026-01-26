import {
  RecipeForm,
  TagSelector,
  useNotification,
  useRecipe,
  useRecipeEditMutator
} from 'chefdeck-shared';
import { useNavigate, useParams } from 'react-router';
import { request } from '../../utils/fetchUtils';

export default function EditRecipePage() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const mutator = useRecipeEditMutator(request, navigate, addNotification, id);

  return (
    <RecipeForm
      {...mutator}
      request={request}
      recipe={error || isLoading ? null : recipe}
      TagSelector={TagSelector}
    />
  );
}
