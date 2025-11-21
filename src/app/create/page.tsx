'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';
import useRequireAuth from '@/hooks/useRequireAuth';

const CreatePage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
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
    const resp = await request('/api/recipe/new', 'POST', formData);
    if (!resp.ok) {
      const error = await resp.json();
      addNotification(error.message || 'Failed to create recipe', 'error');
      return;
    }
    addNotification('Recipe created successfully', 'success');
    router.push(`/dashboard`);
  };
  return <RecipeForm handleSubmit={handleSubmit} />;
};

export default CreatePage;
