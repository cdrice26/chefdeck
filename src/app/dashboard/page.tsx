'use client';

import RecipeCard from '@/components/recipe/RecipeCard';
import { Recipe } from '@/types/Recipe';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string>('');
  const [tries, setTries] = useState<{ recipeId: string; tries: number }[]>([]);

  const handleImageError = async (
    event: React.SyntheticEvent<HTMLImageElement>,
    recipeId: string
  ) => {
    const target = event.target as HTMLImageElement;
    target.src = '/logo.png'; // Fallback image
    setTries((prevTries) =>
      prevTries.map((t) =>
        t.recipeId === recipeId ? { ...t, tries: t.tries + 1 } : t
      )
    );
    if (tries?.find((t) => t?.recipeId === recipeId)?.tries ?? 4 >= 3) {
      console.error('Image failed to load after 3 attempts:', recipeId);
      return;
    }
    const response = await fetch(`/api/recipes/getImageUrl?id=${recipeId}`);
    if (!response.ok) {
      console.error('Failed to fetch image URL for recipe:', recipeId);
      return;
    }
    const imageUrl = await response.text();
    target.src = imageUrl; // Set the new image URL
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) {
        setError('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(data.data);
      setTries(
        data.data.map((recipe: Recipe) => ({ recipeId: recipe.id, tries: 0 }))
      );
    } catch (err) {
      setError('An error occurred while fetching recipes');
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  if (error) {
    return (
      <div className='flex flex-col w-full h-full items-center justify-center'>
        <h1 className='text-xl font-bold'>Error loading recipes</h1>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className='m-4'>
      <h1 className='text-2xl font-bold mb-4'>Your Recipes</h1>
      {recipes && recipes.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => {}}
              onImageError={handleImageError}
            />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center'>
          <h2 className='text-lg'>No recipes found</h2>
          <p>Start adding your recipes!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
