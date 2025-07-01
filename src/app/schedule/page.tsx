'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import useScheduledRecipes from '@/hooks/useScheduledRecipes';
import { useState } from 'react';

const Schedule = () => {
  useRequireAuth();
  const { scheduledRecipes, setStartDate, setEndDate } = useScheduledRecipes();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  return (
    <div>
      <h1>Schedule</h1>
    </div>
  );
};

export default Schedule;
