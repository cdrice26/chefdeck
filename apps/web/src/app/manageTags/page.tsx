'use client';

import request from '@/utils/fetchUtils';
import { useAvailableTags, useNotification, useTagsMutator, ManageTags } from 'chefdeck-shared';

export default function ManageTagsPage() {
  const { availableTags, error, isLoading, refetch } =
    useAvailableTags(request);
  const { addNotification } = useNotification();

  const mutator = useTagsMutator(request, addNotification, refetch);

  return (
    <ManageTags
      {...mutator}
      availableTags={availableTags}
      error={error}
      isLoading={isLoading}
    />
  );
}
