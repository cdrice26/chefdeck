'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from 'chefdeck-shared';
import Confirm from '@/components/pages/Confirm';
import request from '@/utils/fetchUtils';
import useConfirmActions from '@/hooks/useConfirmActions';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useNotification();
  const actions = useConfirmActions(
    request,
    router.replace,
    addNotification,
    searchParams
  );

  return <Confirm {...actions} />;
}
