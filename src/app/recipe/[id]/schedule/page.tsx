'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Card from '@/components/ui/Card';
import { useNotification } from '@/context/NotificationContext';
import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useSchedules from '@/hooks/fetchers/useSchedules';
import getSelectStyles from '@/utils/styles/selectStyles';
import { useParams, useRouter } from 'next/navigation';
import Select from 'react-select';
import useScheduleMutator from '@/hooks/mutators/useScheduleMutator';
import ManageSchedules from '@/components/pages/MangeSchedules';

export default function ScheduleRecipePage() {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { id } = useParams() as { id: string };
  const { addNotification } = useNotification();
  const {
    schedules,
    mutate: setSchedules,
    isLoading,
    error
  } = useSchedules(addNotification, id);
  const isDark = useIsDark();
  const mutator = useScheduleMutator(
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
