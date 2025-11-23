'use client';

import { useRouter } from 'next/navigation';
import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useScheduledRecipes from '@/hooks/fetchers/useScheduledRecipes';
import { useNotification } from '@/context/NotificationContext';
import Schedule from '@/components/pages/Schedule';
import useScheduleActions from '@/hooks/useScheduleActions';
import request from '@/utils/fetchUtils';

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
