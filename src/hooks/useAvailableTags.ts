import { OptionType } from '@/components/forms/TagSelector';
import { useEffect, useState } from 'react';

const useAvailableTags = () => {
  const [availableTags, setAvailableTags] = useState<OptionType[]>([]);

  const fetchAvailableTags = async () => {
    const response = await fetch('/api/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    const json = await response.json();
    setAvailableTags(json);
  };

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  return availableTags;
};

export default useAvailableTags;
