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
