'use client';

import RecipeCard from '@/components/recipe/RecipeCard';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Recipe } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';

const PAGE_SIZE = 20;

const Dashboard = () => {
  const router = useRouter();
  useRequireAuth();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tries, setTries] = useState<{ recipeId: string; tries: number }[]>([]);

  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const tags = useMemo(
    () => searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  // Prevent overlapping fetches
  const fetchingRef = useRef(false);

  // Fetch recipes with pagination
  const fetchRecipes = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: reset ? '1' : String(page),
          limit: String(PAGE_SIZE),
          ...(query && { q: query }),
          ...(tags.length > 0 && { tags: tags.join(',') })
        });
        const response = await request(`/api/recipes?${params}`, 'GET');
        if (!response.ok) {
          setError('Failed to fetch recipes');
          setHasMore(false);
          return;
        }
        const data = await response.json();
        setRecipes((prev) => {
          if (reset) return data.data;
          const existingIds = new Set(prev.map((r) => r.id));
          const newRecipes = data.data.filter(
            (r: Recipe) => !existingIds.has(r.id)
          );
          return [...prev, ...newRecipes];
        });
        setTries((prev) =>
          reset
            ? data.data.map((recipe: Recipe) => ({
                recipeId: recipe.id,
                tries: 0
              }))
            : [
                ...prev,
                ...data.data
                  .filter(
                    (recipe: Recipe) =>
                      !prev.some((t) => t.recipeId === recipe.id)
                  )
                  .map((recipe: Recipe) => ({
                    recipeId: recipe.id,
                    tries: 0
                  }))
              ]
        );
        setHasMore(data.data.length === PAGE_SIZE);
      } catch (err) {
        setError('An error occurred while fetching recipes');
        setHasMore(false);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [page, query, tags]
  );

  // Reset on search/filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setRecipes([]);
    fetchRecipes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tags]);

  // Fetch next page when page changes (but not on first load)
  useEffect(() => {
    if (page === 1) return;
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Infinite scroll
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
      observer.disconnect();
    };
  }, [hasMore, loading]);

  const handleImageError = async (
    event: React.SyntheticEvent<HTMLImageElement>,
    recipeId: string
  ) => {
    const target = event.target as HTMLImageElement;
    target.src = '/logo-icononly.png'; // Fallback image
    setTries((prevTries) =>
      prevTries.map((t) =>
        t.recipeId === recipeId ? { ...t, tries: t.tries + 1 } : t
      )
    );
    if (tries?.find((t) => t?.recipeId === recipeId)?.tries ?? 4 >= 3) {
      return; // Max 3 attempts
    }
    const response = await request(`/api/recipe/${recipeId}/imageUrl`, 'GET');
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

  return (
    <>
      <div className='m-4'>
        <h1 className='text-2xl font-bold mb-4'>Your Recipes</h1>
        {error ? (
          <div className='flex flex-col w-full h-full items-center justify-center'>
            <h1 className='text-xl font-bold'>Error loading recipes</h1>
            <p>Please try again later.</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => router.push(`/recipe/${recipe.id}`)}
                  onImageError={handleImageError}
                  onImageLoad={handleImageLoad}
                />
              ))}
            </div>
            {(hasMore || loading) && (
              <div
                ref={loaderRef}
                className='flex justify-center py-4'
                style={{
                  visibility: hasMore ? 'visible' : 'hidden',
                  height: 40
                }}
              >
                <span>{loading ? 'Loading more...' : ''}</span>
              </div>
            )}
            {loading && page === 1 && (
              <div className='flex flex-col items-center justify-center'>
                <h2 className='text-lg'>Loading Recipes...</h2>
                <p>We're getting your cookbook ready!</p>
              </div>
            )}
            {!loading && recipes.length === 0 && (
              <div className='flex flex-col items-center justify-center'>
                <h2 className='text-lg'>No recipes found</h2>
                <p>Start adding your recipes!</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
