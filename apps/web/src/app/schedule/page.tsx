'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useNotification, useScheduledRecipes, useIsDark, useScheduleActions, Schedule } from 'chefdeck-shared';

const SchedulePage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { addNotification } = useNotification();
  const data = useScheduledRecipes(request, addNotification);
  const isDark = useIsDark();
  const { handleButtonClick } = useScheduleActions(router.push);

  return (
    <Schedule {...data} isDark={isDark} handleButtonClick={handleButtonClick} />
  );
};

export default SchedulePage;
