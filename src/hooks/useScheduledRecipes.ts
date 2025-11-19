import { useNotification } from '@/context/NotificationContext';
import { ScheduleDisplay } from '@/types/Schedule';
import request from '@/utils/fetchUtils';
import { useEffect, useState } from 'react';

const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const lastDay = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
);

/**
 * Hook to load scheduled recipes within a date range.
 *
 * @param initialStartDate - Initial start date to query scheduled recipes. Defaults to the first day of the current month.
 * @param initialEndDate - Initial end date to query scheduled recipes. Defaults to the last day of the current month.
 * @returns An object containing:
 *  - `scheduledRecipes`: ScheduleDisplay[] — the list of scheduled recipes for the current date range
 *  - `setStartDate`: (date: Date) => void — setter for the start date
 *  - `setEndDate`: (date: Date) => void — setter for the end date
 *  - `startDate`: Date — the current start date
 *  - `endDate`: Date — the current end date
 */
const useScheduledRecipes = (
  initialStartDate: Date = firstDay,
  initialEndDate: Date = lastDay
) => {
  const [scheduledRecipes, setScheduledRecipes] = useState<ScheduleDisplay[]>(
    []
  );
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const { addNotification } = useNotification();

  /**
   * Fetch scheduled recipes for the current `startDate` and `endDate` and update state.
   *
   * @returns A promise that resolves when the scheduled recipes have been fetched and state updated.
   */
  const fetchScheduledRecipes = async () => {
    const resp = await request(
      `/api/recipes/scheduled?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      'GET'
    );
    if (!resp.ok) {
      addNotification('Failed to fetch scheduled recipes.', 'error');
    }
    const json = await resp.json();
    setScheduledRecipes(
      json?.data?.map((schedule: ScheduleDisplay) => {
        const d = new Date(schedule.scheduledDate);
        // Create a new Date with only year, month, day (time will be 00:00:00)
        const dateOnly = new Date(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate()
        );
        return {
          ...schedule,
          scheduledDate: dateOnly
        };
      })
    );
  };

  useEffect(() => {
    fetchScheduledRecipes();
  }, [startDate, endDate]);

  return { scheduledRecipes, setStartDate, setEndDate, startDate, endDate };
};

export default useScheduledRecipes;
