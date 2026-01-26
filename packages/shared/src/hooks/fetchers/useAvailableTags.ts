import RequestFn from '@/types/RequestFn';
import useSWR from 'swr';

/**
 * Custom hook that fetches available tags for tag selector components.
 *
 * @param request - The request function to use for fetching data.
 * @returns An object containing:
 *  - `availableTags`: the current list of options for tag inputs
 *  - `refetch`: function to manually re-fetch the available tags
 */
const useAvailableTags = (request: RequestFn) => {
  /**
   * Fetch available tags from the backend and update state.
   *
   * @returns A promise that resolves when the fetch completes and state is updated.
   */
  const fetchAvailableTags = async () => {
    const response = await request('/api/tags', 'GET');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    const json = await response.json();
    return json;
  };

  const {
    data: availableTags,
    error,
    isLoading,
    mutate
  } = useSWR('/api/tags', fetchAvailableTags);

  return { availableTags, error, isLoading, refetch: mutate };
};

export default useAvailableTags;
