import { useNotification } from '@/context/NotificationContext';
import { Schedule } from '@/types/Schedule';
import { useEffect, useState } from 'react';

const useSchedules = (recipeId: string) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { addNotification } = useNotification();

  const fetchSchedules = async () => {
    const resp = await fetch(`/api/recipe/${recipeId}/schedules`);
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
