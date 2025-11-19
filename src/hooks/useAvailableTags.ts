import { OptionType } from '@/components/forms/TagSelector';
import request from '@/utils/fetchUtils';
import { useEffect, useState } from 'react';

/**
 * Custom hook that fetches available tags for tag selector components.
 *
 * @returns An object containing:
 *  - `availableTags`: the current list of options for tag inputs
 *  - `refetch`: function to manually re-fetch the available tags
 */
const useAvailableTags = () => {
  const [availableTags, setAvailableTags] = useState<OptionType[]>([]);

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
    setAvailableTags(json);
  };

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  return { availableTags, refetch: fetchAvailableTags };
};

export default useAvailableTags;
