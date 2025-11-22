'use client';

import { useNotification } from '@/context/NotificationContext';
import useAvailableTags from '@/hooks/fetchers/useAvailableTags';
import useTagsMutator from '@/hooks/mutators/useTagsMutator';
import ManageTags from '@/components/pages/ManageTags';

export default function ManageTagsPage() {
  const { availableTags, error, isLoading, refetch } = useAvailableTags();
  const { addNotification } = useNotification();

  const mutator = useTagsMutator(addNotification, refetch);

  return (
    <ManageTags
      {...mutator}
      availableTags={availableTags}
      error={error}
      isLoading={isLoading}
    />
  );
}
