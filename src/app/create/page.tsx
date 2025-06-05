'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';
import { useRouter } from 'next/navigation';

const CreatePage = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const resp = await fetch('/api/recipes/new', {
      body: formData,
      method: 'POST'
    });
    if (!resp.ok) {
      const error = await resp.json();
      console.error('Error creating recipe:', error);
      throw new Error(error.message || 'Failed to create recipe');
    }
    const data = await resp.json();
    console.log('Recipe created successfully:', data);
    router.push(`/dashboard`);
  };
  return <RecipeForm handleSubmit={handleSubmit} />;
};

export default CreatePage;
