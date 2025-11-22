import { NotificationKind } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';

export interface RecipeMutator {
  handleDelete: () => Promise<void>;
  handleEdit: () => void;
  handleSchedule: () => void;
}

const useRecipeMutator = (
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void,
  recipeId: string
) => {
  const handleDelete = async () => {
    const confirmed = confirm(
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
