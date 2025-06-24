'use client';

import RecipeCard from '@/components/recipe/RecipeCard';
import { Recipe } from '@/types/Recipe';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tries, setTries] = useState<{ recipeId: string; tries: number }[]>([]);

  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const tags = useMemo(
    () => searchParams.get('tags')?.split(',') ?? [],
    [searchParams]
  );
  const filteredRecipes = useMemo(
    () =>
      recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query.toLowerCase()) &&
          (tags.length === 0 ||
            (recipe.tags && tags.every((tag) => recipe?.tags?.includes(tag))))
      ),
    [recipes, query, tags]
  );

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
      return; // Max 3 attempts
    }
    const response = await fetch(`/api/recipe/${recipeId}/imageUrl`);
    if (!response.ok) {
      console.error('Failed to fetch image URL for recipe:', recipeId);
      return;
    }
    const imageUrl = await response.text();
    target.src = imageUrl; // Set the new image URL
  };

  const handleImageLoad = (recipeId: string) => {
    setTries((prevTries) =>
      prevTries.map((t) => (t.recipeId === recipeId ? { ...t, tries: 0 } : t))
    );
  };

  const fetchRecipes = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    <>
      <div className='m-4'>
        <h1 className='text-2xl font-bold mb-4'>Your Recipes</h1>
        {loading ? (
          <div className='flex flex-col items-center justify-center'>
            <h2 className='text-lg'>Loading Recipes...</h2>
            <p>We're getting your cookbook ready!</p>
          </div>
        ) : filteredRecipes && filteredRecipes.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {filteredRecipes
              .sort(
                (a, b) =>
                  (b?.lastViewed !== undefined
                    ? new Date(b?.lastViewed)?.getTime()
                    : 0) -
                  (a?.lastViewed !== undefined
                    ? new Date(a?.lastViewed)?.getTime()
                    : 0)
              )
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => {
                    router.push(`/recipe/${recipe.id}`);
                  }}
                  onImageError={handleImageError}
                  onImageLoad={handleImageLoad}
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
    </>
  );
};

export default Dashboard;
