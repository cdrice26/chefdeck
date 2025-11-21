'use client';

import RecipeDetails from '@/components/recipe/RecipeDetails';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/useRecipe';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import printComponent from '@/utils/printUtils';
import { getButtonColorClass, getColorClass } from '@/utils/styles/colorUtils';
import { useParams, useRouter } from 'next/navigation';

export default function RecipePage() {
  const router = useRouter();
  useRequireAuth(router.replace);

  const { id } = useParams() as { id: string };

  const { recipe, isLoading, error } = useRecipe(id as string);
  const { addNotification } = useNotification();

  const handleDelete = async () => {
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

  const handlePrint = () => {
    if (recipe === null || recipe === undefined) {
      addNotification(
        "Couldn't print recipe, please try again later.",
        'error'
      );
      return;
    }

    try {
      printComponent(
        <RecipeDetails recipe={recipe} error={null} isLoading={false} />,
        'Print Recipe'
      );
    } catch (e) {
      addNotification(
        "Couldn't print recipe, please try again later.",
        'error'
      );
      return;
    }
  };

  return (
    <div className="flex flex-1 justify-center items-center w-full">
      <div
        className={`w-full sm:w-[80%] md:w-[70%] lg:w-[60%] h-full sm:h-auto p-4 ${
          recipe?.color
            ? getColorClass(recipe?.color)
            : 'bg-white dark:bg-[#222]'
        } relative transition duration-300 justify-start my-[50px] sm:rounded-lg shadow-md`}
      >
        <>
          <RecipeDetails recipe={recipe} isLoading={isLoading} error={error} />
          {!(isLoading || error) && (
            <div className="flex flex-row flex-wrap gap-4 mt-4">
              <button
                className={`rounded-full px-6 py-2 ${getButtonColorClass(
                  recipe?.color
                )}`}
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className={`rounded-full px-6 py-2 ${getButtonColorClass(
                  recipe?.color
                )}`}
                onClick={() => router.push(`/recipe/${id}/schedule`)}
              >
                Manage Schedules
              </button>
              <button
                className={`rounded-full px-6 py-2 ${getButtonColorClass(
                  recipe?.color
                )}`}
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                className={`rounded-full px-6 py-2 ${getButtonColorClass(
                  recipe?.color
                )}`}
                onClick={() => router.push(`/recipe/${id}/edit`)}
              >
                Edit
              </button>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
