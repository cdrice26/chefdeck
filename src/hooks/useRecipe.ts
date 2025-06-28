import { Recipe } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import { useState, useEffect } from 'react';

const useRecipe = (recipeId: string) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);

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
