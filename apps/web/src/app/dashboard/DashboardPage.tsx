'use client';

import usePaginatedRecipes from '@/hooks/fetchers/usePaginatedRecipes';
import useImageRefetcher from '@/hooks/fetchers/useImageRefetcher';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useRef } from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import Dashboard from '@/components/pages/Dashboard';

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
 * @returns The dashboard UI containing recipe cards, loader, and status messages.
 */
const DashboardPage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);

  const searchParams = useSearchParams();
  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const tags = useMemo(
    () => searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  const { recipes, page, setPage, hasMore, loading, error } =
    usePaginatedRecipes(request, query, tags);
  const { handleImageError, handleImageLoad } = useImageRefetcher(request);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll(loaderRef, hasMore, loading, setPage, recipes.length);

  return (
    <Dashboard
      recipes={recipes}
      page={page}
      hasMore={hasMore}
      loading={loading}
      loaderRef={loaderRef}
      error={error}
      redirect={router.push}
      handleImageError={handleImageError}
      handleImageLoad={handleImageLoad}
    />
  );
};

export default DashboardPage;
