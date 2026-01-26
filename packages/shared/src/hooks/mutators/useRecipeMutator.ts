import { NotificationKind } from '@/context/NotificationContext';
import RequestFn from '@/types/RequestFn';

export interface RecipeMutator {
  handleDelete: () => Promise<void>;
  handleEdit: () => void;
  handleSchedule: () => void;
}

/**
 * Hook for handling recipe mutations.
 *
 * @param request - Function to make HTTP requests
 * @param redirect - Function to redirect to new URL
 * @param addNotification - Function to add a notification
 * @param recipeId - ID of the recipe
 * @returns An object with the following properties:
 * - handleDelete: Function to handle recipe deletion
 * - handleEdit: Function to handle recipe editing
 * - handleSchedule: Function to handle recipe scheduling
 */
const useRecipeMutator = (
  request: RequestFn,
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void,
  recipeId: string,
  confirm: (message: string) => Promise<boolean>
) => {
  const handleDelete = async () => {
    const confirmed = await confirm(
      'Deleting a recipe is permanent and cannot be undone. Are you sure?'
    );

    if (!confirmed) {
      return;
    }

    const resp = await request(`/api/recipe/${recipeId}/delete`, 'DELETE');

    if (!resp.ok) {
      addNotification('Failed to delete recipe.', 'error');
    } else {
      const json = await resp.json();
      addNotification(json.data.message, 'success');
      redirect('/dashboard');
    }
  };

  const handleEdit = () => {
    redirect(`/recipe/${recipeId}/edit`);
  };

  const handleSchedule = () => {
    redirect(`/recipe/${recipeId}/schedule`);
  };

  return {
    handleDelete,
    handleEdit,
    handleSchedule
  };
};

export default useRecipeMutator;
