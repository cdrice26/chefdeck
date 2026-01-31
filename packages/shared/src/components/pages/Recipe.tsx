import RecipeDetails from '@/components/recipe/RecipeDetails';
import { RecipeMutator } from '@/hooks/mutators/useRecipeMutator';
import { getButtonColorClass, getColorClass } from '@/utils/styles/colorUtils';
import { Recipe as RecipeType } from '@/types/Recipe';

interface RecipeProps extends RecipeMutator {
  recipe: RecipeType;
  isLoading: boolean;
  error: Error | null;
  handlePrint: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Recipe = ({
  recipe,
  isLoading,
  error,
  handleDelete,
  handlePrint,
  handleEdit,
  handleSchedule
}: RecipeProps) => (
  <div className="flex flex-1 justify-center items-center w-full">
    <div
      className={`w-full md:min-w-[600px] sm:w-[80%] md:w-[70%] lg:w-[60%] h-full sm:h-auto p-4 ${
        recipe?.color ? getColorClass(recipe?.color) : 'bg-white dark:bg-[#222]'
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
              onClick={handleSchedule}
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
              onClick={handleEdit}
            >
              Edit
            </button>
          </div>
        )}
      </>
    </div>
  </div>
);

export default Recipe;
