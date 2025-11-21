import { useNotification } from '@/context/NotificationContext';
import { Schedule } from '@/types/Schedule';
import request from '@/utils/fetchUtils';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch and manage schedules for a given recipe.
 *
 * @param recipeId - The ID of the recipe whose schedules will be loaded.
 * @returns An object containing:
 *  - `schedules`: Schedule[] — the list of schedules for the recipe
 *  - `setSchedules`: function to update schedules state
 */
const useSchedules = (recipeId: string) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { addNotification } = useNotification();

  /**
   * Fetch schedules for the recipe from the API and update local state.
   *
   * @returns A promise that resolves when the schedules have been fetched and state updated.
   */
  const fetchSchedules = async () => {
    const resp = await request(`/api/recipe/${recipeId}/schedules`, 'GET');
    if (!resp.ok) {
      addNotification('Error fetching schedules.', 'error');
      return;
    }
    const json = await resp.json();
    setSchedules(
      json.data.map((r: any) => ({
        id: r.id,
        recipeId,
        date: new Date(r.date),
        repeat: r.repeat,
        endRepeat: new Date(r.endRepeat)
      }))
    );
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return { schedules, setSchedules };
};

export default useSchedules;
