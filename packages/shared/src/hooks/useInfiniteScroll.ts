import { useRef, useEffect } from 'react';

/**
 * Infinite scroll loader with observer cleanup
 */
const useInfiniteScroll = (
  loaderRef: React.RefObject<HTMLDivElement | null>,
  hasMore: boolean,
  loading: boolean,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  numItems: number
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;
    if (!hasMore || loading) return;

    // Always disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p: number) => p + 1);
        }
      },
      { threshold: 1 }
    );
    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, numItems]); // numItems ensures observer reattaches after reset
};

export default useInfiniteScroll;
