import { OptionType } from '@/components/forms/TagSelector';
import request from '@/utils/fetchUtils';
import { useEffect, useState } from 'react';

const useAvailableTags = () => {
  const [availableTags, setAvailableTags] = useState<OptionType[]>([]);

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
