import { Recipe } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import { useState, useEffect } from 'react';

/**
 * Hook that fetches and returns a single recipe by its identifier.
 *
 * @param recipeId - The ID of the recipe to fetch from the API.
 * @returns The fetched Recipe object, or `null` when not loaded or not found.
 */
const useRecipe = (recipeId: string): Recipe | null => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  /**
   * Fetch the recipe from the backend and update local state.
   *
   * @returns A promise that resolves when the fetch completes and state is updated.
   */
  const fetchRecipe = async () => {
    const resp = await request(`/api/recipe/${recipeId}`, 'GET');
    const data = await resp.json();
    setRecipe(data?.data?.recipe);
  };

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  return recipe;
};

export default useRecipe;
