import { Recipe } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import useSWR from 'swr';

interface UseRecipeResponse {
  recipe: Recipe;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook that fetches and returns a single recipe by its identifier.
 *
 * @param recipeId - The ID of the recipe to fetch from the API.
 * @returns The fetched Recipe object, or `null` when not loaded or not found.
 */
const useRecipe = (recipeId: string): UseRecipeResponse => {
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
