'use client';

import { useNotification } from '@/context/NotificationContext';
import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useSchedules from '@/hooks/fetchers/useSchedules';
import { useParams, useRouter } from 'next/navigation';
import useScheduleMutator from '@/hooks/mutators/useScheduleMutator';
import ManageSchedules from '@/components/pages/MangeSchedules';
import request from '@/utils/fetchUtils';

export default function ScheduleRecipePage() {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { id } = useParams() as { id: string };
  const { addNotification } = useNotification();
  const {
    schedules,
    mutate: setSchedules,
    isLoading,
    error
  } = useSchedules(request, addNotification, id);
  const isDark = useIsDark();
  const mutator = useScheduleMutator(
    request,
    router.push,
    addNotification,
    id,
    schedules,
    setSchedules
  );

  return (
    <ManageSchedules
      {...mutator}
      error={error}
      isLoading={isLoading}
      schedules={schedules}
      isDark={isDark}
    />
  );
}
