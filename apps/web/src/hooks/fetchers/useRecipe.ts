import { Recipe } from '@/types/Recipe';
import RequestFn from '@/types/RequestFn';
import useSWR from 'swr';

interface UseRecipeResponse {
  recipe: Recipe;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook that fetches and returns a single recipe by its identifier.
 *
 * @param request - The request function to use for fetching the recipe.
 * @param recipeId - The ID of the recipe to fetch from the API.
 * @returns The fetched Recipe object, or `null` when not loaded or not found.
 */
const useRecipe = (request: RequestFn, recipeId: string): UseRecipeResponse => {
  /**
   * Fetch the recipe from the backend and update local state.
   *
   * @returns A promise that resolves when the fetch completes and state is updated.
   */
  const fetchRecipe = async () => {
    const resp = await request(`/api/recipe/${recipeId}`, 'GET');
    const data = await resp.json();
    return data?.data?.recipe;
  };

  const {
    data: recipe,
    isLoading,
    error
  } = useSWR(`/api/recipe/${recipeId}`, fetchRecipe);

  return { recipe, isLoading, error };
};

export default useRecipe;
