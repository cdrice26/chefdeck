'use client';

import { useRouter } from 'next/navigation';
import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useScheduledRecipes from '@/hooks/fetchers/useScheduledRecipes';
import { useNotification } from '@/context/NotificationContext';
import Schedule from '@/components/pages/Schedule';
import useScheduleActions from '@/hooks/useScheduleActions';

const SchedulePage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { addNotification } = useNotification();
  const data = useScheduledRecipes(addNotification);
  const isDark = useIsDark();
  const { handleButtonClick } = useScheduleActions(router.push);

  return (
    <Schedule {...data} isDark={isDark} handleButtonClick={handleButtonClick} />
  );
};

export default SchedulePage;
