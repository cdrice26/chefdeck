'use client';

import RecipeDetails from '@/components/recipe/RecipeDetails';
import Modal from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/useRecipe';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { getColorClass } from '@/utils/styles/colorUtils';
import { useParams, useRouter } from 'next/navigation';

export default function RecipePage() {
  useRequireAuth();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const recipe = useRecipe(id as string);
  const { addNotification } = useNotification();

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      'Deleting a recipe is permanent and cannot be undone. Are you sure?'
    );

    if (!confirmed) {
      return;
    }

    const resp = await request(`/api/recipe/${id}/delete`, 'DELETE');

    if (!resp.ok) {
      addNotification('Failed to delete recipe.', 'error');
    } else {
      const json = await resp.json();
      addNotification(json.data.message, 'success');
      router.push('/dashboard');
    }
  };

  const handlePrint = (id: string) => {};

  return recipe ? (
    <div className='w-full h-full flex justify-center'>
      <div
        className={`w-full h-full sm:w-[80%] sm:h-[80%] md:w-[70%] lg:w-[60%] p-4 ${
          recipe?.color
            ? getColorClass(recipe?.color)
            : 'bg-white dark:bg-[#222]'
        } relative transition duration-300 justify-start my-[50px] overflow-y-auto sm:rounded-lg`}
      >
        <RecipeDetails
          id={id}
          recipe={recipe}
          handleDelete={handleDelete}
          handlePrint={handlePrint}
        />
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
