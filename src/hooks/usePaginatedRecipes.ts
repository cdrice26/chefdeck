import { useEffect, useState, useRef } from 'react';
import { Recipe } from '@/types/Recipe';
import request from '@/utils/fetchUtils';

const PAGE_SIZE = 20;

export default function usePaginatedRecipes(query: string, tags: string[]) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset state when filters change
    setRecipes([]);
    setPage(1);
    setHasMore(true);
    setError('');
  }, [query, tags]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(query && { q: query }),
          ...(tags.length > 0 && { tags: tags.join(',') })
        });
        const response = await request(`/api/recipes?${params}`, 'GET');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        if (!isMounted.current) return;

        setRecipes((prev) =>
          page === 1
            ? data.data
            : [
                ...prev,
                ...data.data.filter(
                  (r: Recipe) => !prev.some((p) => p.id === r.id)
                )
              ]
        );
        setHasMore(data.data.length === PAGE_SIZE);
      } catch (err: any) {
        if (isMounted.current) {
          setError(err.message || 'An error occurred while fetching recipes');
          setHasMore(false);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, query, tags]);

  return {
    recipes,
    page,
    setPage,
    hasMore,
    loading,
    error
  };
}
