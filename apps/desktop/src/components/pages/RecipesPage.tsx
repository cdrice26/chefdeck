import {
  Dashboard,
  useImageRefetcher,
  useInfiniteScroll,
  usePaginatedRecipes
} from 'chefdeck-shared';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { request } from '../../utils/fetchUtils';

export default function RecipesPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const tags = useMemo(
    () => searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  const { recipes, page, setPage, hasMore, loading, error } =
    usePaginatedRecipes(request, query, tags);

  useEffect(() => {
    console.log(recipes, loading, error);
  });
  const { handleImageError, handleImageLoad } = useImageRefetcher(request);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll(loaderRef, hasMore, loading, setPage, recipes?.length);

  return (
    <Dashboard
      recipes={recipes}
      page={page}
      hasMore={hasMore}
      loading={loading}
      loaderRef={loaderRef}
      error={error}
      redirect={navigate}
      handleImageError={handleImageError}
      handleImageLoad={handleImageLoad}
    />
  );
}
