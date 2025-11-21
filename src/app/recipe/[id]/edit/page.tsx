'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/fetchers/useRecipe';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useParams, useRouter } from 'next/navigation';

export default function EditRecipePage() {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { id } = useParams();
  const { recipe, isLoading, error } = useRecipe(id as string);
  const { addNotification } = useNotification();

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
    const resp = await request(`/api/recipe/${id}/update`, 'POST', formData);
    if (!resp.ok) {
      const error = await resp.json();
      addNotification(error.message || 'Failed to update recipe', 'error');
      return;
    }
    addNotification('Recipe updated successfully', 'success');
    router.push(`/dashboard`);
  };

  return (
    <div>
      <RecipeForm
        handleSubmit={handleSubmit}
        recipe={error || isLoading ? null : recipe}
      />
    </div>
  );
}
