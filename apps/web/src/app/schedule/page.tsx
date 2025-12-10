'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import {
  useNotification,
  useScheduledRecipes,
  useIsDark,
  useScheduleActions,
  Schedule
} from 'chefdeck-shared';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

const SchedulePage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { addNotification } = useNotification();
  const data = useScheduledRecipes(request, addNotification);
  const isDark = useIsDark();
  const { handleButtonClick } = useScheduleActions(router.push);

  return (
    <Schedule
      {...data}
      isDark={isDark}
      handleButtonClick={handleButtonClick}
      SelectComponent={Select as (props: any) => React.ReactNode}
    />
  );
};

export default SchedulePage;
