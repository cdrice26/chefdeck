'use client';

import RecipeCard from '@/components/recipe/RecipeCard';
import usePaginatedRecipes from '@/hooks/fetchers/usePaginatedRecipes';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';

/**
 * Dashboard component.
 *
 * Renders the user's recipe grid with infinite scroll, robust image error/retry logic,
 * and handles loading / error states. The component relies on `usePaginatedRecipes`
 * for fetching paginated recipe data and `useRequireAuth` to ensure the user is authenticated.
 *
 * Behavior:
 * - Implements an intersection observer on a loader element to trigger fetching additional pages.
 * - Maintains a retry counter for image loading failures and requests updated image URLs when needed.
 * - Displays appropriate UI for loading, empty state, and error conditions.
 *
 * @component
 * @returns {JSX.Element} The dashboard UI containing recipe cards, loader, and status messages.
 */
const Dashboard = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
  const searchParams = useSearchParams();

  const [tries, setTries] = useState<{ recipeId: string; tries: number }[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const tags = useMemo(
    () => searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  const { recipes, page, setPage, hasMore, loading, error } =
    usePaginatedRecipes(query, tags);

  // Infinite scroll loader with robust observer cleanup
  useEffect(() => {
    if (!loaderRef.current) return;
    if (!hasMore || loading) return;

    // Always disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, recipes.length]); // recipes.length ensures observer reattaches after reset

  // Image error/retry logic
  const handleImageError = async (
    event: React.SyntheticEvent<HTMLImageElement>,
    recipeId: string
  ) => {
    const target = event.target as HTMLImageElement;
    target.src = '/logo-icononly.png';
    setTries((prevTries) =>
      prevTries.map((t) =>
        t.recipeId === recipeId ? { ...t, tries: t.tries + 1 } : t
      )
    );
    if ((tries.find((t) => t.recipeId === recipeId)?.tries ?? 0) >= 3) {
      return;
    }
    const response = await request(`/api/recipe/${recipeId}/imageUrl`, 'GET');
    if (!response.ok) return;
    const imageUrl = await response.text();
    target.src = imageUrl;
  };

  const handleImageLoad = (recipeId: string) => {
    setTries((prevTries) =>
      prevTries.map((t) => (t.recipeId === recipeId ? { ...t, tries: 0 } : t))
    );
  };

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold mb-4">Your Recipes</h1>
      {error ? (
        <div className="flex flex-col w-full h-full items-center justify-center">
          <h1 className="text-xl font-bold">Error loading recipes</h1>
          <p>Please try again later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => router.push(`/recipe/${recipe.id}`)}
                onImageError={(e) => handleImageError(e, recipe.id)}
                onImageLoad={() => handleImageLoad(recipe.id)}
              />
            ))}
          </div>
          {(hasMore || loading) && (
            <div
              ref={loaderRef}
              className="flex justify-center py-4"
              style={{
                visibility: hasMore ? 'visible' : 'hidden',
                height: 40
              }}
            >
              <span>{loading && page !== 1 ? 'Loading more...' : ''}</span>
            </div>
          )}
          {loading && page === 1 && (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-lg">Loading Recipes...</h2>
              <p>We're getting your cookbook ready!</p>
            </div>
          )}
          {!loading && recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-lg">No recipes found</h2>
              <p>Start adding your recipes!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
