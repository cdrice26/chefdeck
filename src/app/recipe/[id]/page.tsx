'use client';

import RecipeDetails from '@/components/recipe/RecipeDetails';
import { useNotification } from '@/context/NotificationContext';
import useRecipe from '@/hooks/useRecipe';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { getButtonColorClass, getColorClass } from '@/utils/styles/colorUtils';
import { useParams, useRouter } from 'next/navigation';
import { createRoot } from 'react-dom/client';

export default function RecipePage() {
  useRequireAuth();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const recipe = useRecipe(id as string);
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

    const printWindow = window.open('', '_blank');

    if (printWindow)
      printWindow.document.head.innerHTML = `
        <title>Print Recipe</title>
        <style>
          body { font-family: Arial, sans-serif; }
        </style>
      `;

    const printDiv = document.createElement('div');
    printWindow?.document.body.appendChild(printDiv);

    const printRoot = createRoot(printDiv);
    printRoot.render(<RecipeDetails recipe={recipe} />);

    if (printWindow === null || printWindow === undefined) {
      addNotification(
        "Couldn't print recipe, please try again later.",
        'error'
      );
      return;
    }

    // Use MutationObserver to detect when the content is rendered
    const observer = new MutationObserver(() => {
      // Check if the printDiv has child nodes
      if (printDiv.childNodes.length > 0) {
        printWindow.print(); // Call the print function
        printWindow.close(); // Close the print window after printing
        observer.disconnect(); // Stop observing
      }
    });

    // Start observing the printDiv for child nodes
    observer.observe(printDiv, { childList: true, subtree: true });
  };

  return (
    <div className='w-full h-full flex justify-center'>
      <div
        className={`w-full h-full sm:w-[80%] sm:h-[80%] md:w-[70%] lg:w-[60%] p-4 ${
          recipe?.color
            ? getColorClass(recipe?.color)
            : 'bg-white dark:bg-[#222]'
        } relative transition duration-300 justify-start my-[50px] overflow-y-auto sm:rounded-lg shadow-md`}
      >
        {recipe ? (
          <>
            <RecipeDetails recipe={recipe} />
            <div className='flex flex-row flex-wrap gap-4 mt-4'>
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
          </>
        ) : (
          <div className='w-full h-full flex justify-center items-center text-4xl font-bold'>
            Loading Recipe...
          </div>
        )}
      </div>
    </div>
  );
}
