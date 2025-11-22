import { NotificationKind } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';

export interface RecipeEditMutator {
  handleSubmit: (e: FormData) => Promise<void>;
}

/**
 * Hook for handling recipe edit mutations.
 *
 * @param redirect - Function to redirect to a URL
 * @param addNotification - Function to add a notification
 * @param recipeId - ID of the recipe being edited
 * @returns An object with the following properties:
 * - handleSubmit: Function to handle recipe edit submission
 */
const useRecipeEditMutator = (
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void,
  recipeId: string
): RecipeEditMutator => {
  const handleSubmit = async (e: FormData) => {
    const formData = e;
    if (formData.get('ingredientNames') === null) {
      addNotification('Please add at least one ingredient', 'error');
      return;
    }
    if (formData.get('directions') === null) {
      addNotification('Please add at least one direction', 'error');
      return;
    }
    if (formData.get('color') === null || formData.get('color') === '') {
      formData.set('color', 'white'); // Default color if not set
    }
    const resp = await request(
      `/api/recipe/${recipeId}/update`,
      'POST',
      formData
    );
    if (!resp.ok) {
      const error = await resp.json();
      addNotification(error.message || 'Failed to update recipe', 'error');
      return;
    }
    addNotification('Recipe updated successfully', 'success');
    redirect(`/dashboard`);
  };

  return { handleSubmit };
};

export default useRecipeEditMutator;
