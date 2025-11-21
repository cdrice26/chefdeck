import { NotificationKind } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';

/**
 * Hook to create a new recipe.
 *
 * @param redirect - Function to redirect to different page.
 * @param addNotification - Function to add a notification.
 * @returns an object with a handleSubmit function which takes a FormData object as input.
 */
const useRecipeCreator = (
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void
) => {
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
    const resp = await request('/api/recipe/new', 'POST', formData);
    if (!resp.ok) {
      const error = await resp.json();
      addNotification(error.message || 'Failed to create recipe', 'error');
      return;
    }
    addNotification('Recipe created successfully', 'success');
    redirect(`/dashboard`);
  };

  return { handleSubmit };
};

export default useRecipeCreator;
