import {
  Dashboard,
  useInfiniteScroll,
  usePaginatedRecipes
} from 'chefdeck-shared';
import { useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { request } from '../../utils/fetchUtils';
import { convertFileSrc } from '@tauri-apps/api/core';

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

  const updatedRecipes = useMemo(() => {
    const newRecipes = recipes.map((recipe) => ({
      ...recipe,
      imgUrl: recipe?.imgUrl !== null ? convertFileSrc(recipe?.imgUrl) : null
    }));
    return newRecipes;
  }, [recipes]);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll(loaderRef, hasMore, loading, setPage, recipes?.length);

  return (
    <Dashboard
      recipes={updatedRecipes}
      page={page}
      hasMore={hasMore}
      loading={loading}
      loaderRef={loaderRef}
      error={error}
      redirect={navigate}
      handleImageError={() => {}}
      handleImageLoad={() => {}}
    />
  );
}
