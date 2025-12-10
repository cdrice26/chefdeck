import { useNavigate } from 'react-router';
import { RecipeForm, useNotification, useRecipeCreator } from 'chefdeck-shared';
import { request } from '../../utils/fetchUtils';

export default function AddRecipePage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(request, navigate, addNotification);

  return <RecipeForm request={request} handleSubmit={handleSubmit} />;
}
