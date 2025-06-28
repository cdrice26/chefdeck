'use client';

import useRequireAuth from '@/hooks/useRequireAuth';

const Schedule = () => {
  useRequireAuth();
  return (
    <div>
      <h1>Schedule</h1>
    </div>
  );
};

export default Schedule;
