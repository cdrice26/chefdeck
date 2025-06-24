import { Schedule } from '@/types/Schedule';
import { useState } from 'react';

const useSchedules = (recipeId: string) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = async () => {};
};

export default useSchedules;
