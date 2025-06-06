'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

const CreatePage = () => {
  const router = useRouter();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
    const resp = await fetch('/api/recipes/new', {
      body: formData,
      method: 'POST'
    });
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
