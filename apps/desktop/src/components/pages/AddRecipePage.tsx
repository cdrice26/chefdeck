import { useNavigate } from 'react-router';
import {
  RecipeForm,
  useNotification,
  useRecipeCreator
} from 'cookycardz-shared';
import { request, requestFromFormData } from '../../utils/fetchUtils';
import { TagSelector } from 'cookycardz-shared';
import FileInput from '../forms/FileInput';

export default function AddRecipePage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(
    requestFromFormData,
    navigate,
    addNotification
  );

  return (
    <RecipeForm
      request={request}
      handleSubmit={handleSubmit}
      TagSelector={TagSelector}
      FileInput={FileInput}
    />
  );
}
