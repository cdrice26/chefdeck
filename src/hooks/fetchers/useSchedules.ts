import { NotificationKind } from '@/context/NotificationContext';
import { Schedule } from '@/types/Schedule';
import request from '@/utils/fetchUtils';
import useSWR, { KeyedMutator } from 'swr';

export interface ScheduleResponse {
  schedules: Schedule[];
  isLoading: boolean;
  error: Error | null;
  mutate: KeyedMutator<Schedule[]>;
}

/**
 * Hook to fetch and manage schedules for a given recipe.
 *
 * @param addNotification - Function to add a notification.
 * @param recipeId - The ID of the recipe whose schedules will be loaded.
 * @returns An object containing:
 *  - `schedules`: Schedule[] — the list of schedules for the recipe
 *  - `setSchedules`: function to update schedules state
 */
const useSchedules = (
  addNotification: (message: string, type: NotificationKind) => void,
  recipeId: string
): ScheduleResponse => {
  const fetchSchedules = async () => {
    const resp = await request(`/api/recipe/${recipeId}/schedules`, 'GET');
    if (!resp.ok) {
      addNotification('Error fetching schedules.', 'error');
      return;
    }
    const json = await resp.json();
    return json.data.map((r: any) => ({
      id: r.id,
      recipeId,
      date: new Date(r.date),
      repeat: r.repeat,
      endRepeat: new Date(r.endRepeat)
    }));
  };

  const {
    data: schedules,
    isLoading,
    error,
    mutate
  } = useSWR(`/api/recipe/${recipeId}/schedules`, fetchSchedules);

  return { schedules, isLoading, error, mutate };
};

export default useSchedules;
