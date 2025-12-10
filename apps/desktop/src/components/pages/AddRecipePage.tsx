import { useNavigate } from 'react-router';
import { RecipeForm, useNotification, useRecipeCreator } from 'chefdeck-shared';
import { request } from '../../utils/fetchUtils';
import { TagSelector } from 'chefdeck-shared';
import FileInput from '../forms/FileInput';

export default function AddRecipePage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(request, navigate, addNotification);

  return (
    <RecipeForm
      request={request}
      handleSubmit={handleSubmit}
      TagSelector={TagSelector}
      FileInput={FileInput}
    />
  );
}
