import RequestFn from '@/types/RequestFn';
import { useState } from 'react';

/**
 * Hook for handling image refetching logic in case that the signed URL expires or otherwise doesn't work.
 *
 * @param request - The request function to use for fetching the image URL.
 * @returns an object containing the following properties:
 * - handleImageError: A function to handle image errors and retry logic.
 * - handleImageLoad: A function to handle image load events and reset the retry count.
 */
const useImageRefetcher = (request: RequestFn) => {
  const [tries, setTries] = useState<{ recipeId: string; tries: number }[]>([]);

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

  return {
    handleImageError,
    handleImageLoad
  };
};

export default useImageRefetcher;
