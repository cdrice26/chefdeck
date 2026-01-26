'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import { useParams, useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';
import { useNotification, useSchedules, useIsDark, useScheduleMutator, ManageSchedules } from 'chefdeck-shared';

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
