import { useNavigate, useParams } from 'react-router';
import { request } from '../../utils/fetchUtils';
import {
  ManageSchedules,
  useIsDark,
  useNotification,
  useScheduleMutator,
  useSchedules
} from 'cookycardz-shared';

export default function ManageSchedulesPage() {
  const navigate = useNavigate();
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
    navigate,
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
