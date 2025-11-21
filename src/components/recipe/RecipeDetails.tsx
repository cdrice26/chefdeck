'use client';

import { Recipe } from '@/types/Recipe';
import { getButtonColorClass } from '@/utils/styles/colorUtils';
import IngredientDisplay from './IngredientDisplay';

/**
 * RecipeDetails component.
 *
 * Renders full details for a recipe including title, tags, metadata (yield/time/source),
 * an optional image, the list of ingredients (formatted) and the step-by-step directions.
 *
 * Props:
 * - `recipe` (Recipe): The recipe object to display. Expected fields include `title`, `tags`,
 *   `servings`, `minutes`, `sourceUrl`, `imgUrl`, `ingredients`, and `directions`.
 * - `isLoading` (boolean): Indicates whether the recipe is currently being loaded.
 * - `error` (Error): An error object if there was an error loading the recipe.
 *
 * @param {Recipe} props.recipe - The recipe to render.
 * @returns {JSX.Element} The rendered recipe details UI.
 */
interface RecipeDetailsProps {
  recipe: Recipe;
  isLoading: boolean;
  error: Error | null;
}

const RecipeDetails = ({ recipe, isLoading, error }: RecipeDetailsProps) =>
  isLoading ? (
    <h1 className="text-4xl font-bold flex flex-row flex-wrap justify-start">
      Loading Recipe...
    </h1>
  ) : error ? (
    <div>Error Loading Recipe</div>
  ) : (
    <>
      <h1 className="text-4xl font-bold flex flex-row flex-wrap justify-start">
        {recipe?.title}
        {(recipe?.tags?.length ?? 0) > 0 &&
          recipe?.tags?.map((tag, index) => (
            <div
              className={`ml-2 px-4 py-1 rounded-full min-w-10 text-sm flex items-center justify-center ${getButtonColorClass(
                recipe?.color,
                false
              )}`}
              key={index}
            >
              {tag}
            </div>
          ))}
      </h1>
      <ul className="flex flex-row items-center justify-start gap-2">
        <li>
          <strong>Yield:</strong> {recipe?.servings} Servings
        </li>
        <li>
          <strong>Time:</strong> {recipe?.minutes} Minutes
        </li>
        {recipe?.sourceUrl && (
          <li>
            <strong>Source:</strong>{' '}
            <a href={recipe?.sourceUrl}>{recipe?.sourceUrl}</a>
          </li>
        )}
      </ul>
      {recipe?.imgUrl && (
        <img
          src={recipe?.imgUrl}
          className="max-h-[300px] max-w-[500px] w-auto rounded-lg object-cover"
        />
      )}
      <strong className="text-lg">Ingredients:</strong>
      <ul className="list-disc ml-4">
        {recipe?.ingredients?.map((ingredient) => (
          <IngredientDisplay key={ingredient.id} ingredient={ingredient} />
        ))}
      </ul>
      <strong className="text-lg">Directions:</strong>
      <ul className="list-disc ml-4">
        {recipe?.directions?.map((direction) => (
          <li key={direction?.id}>{direction?.content}</li>
        ))}
      </ul>
    </>
  );

export default RecipeDetails;
