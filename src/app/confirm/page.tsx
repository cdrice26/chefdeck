import Confirm from '@/components/pages/Confirm';
import { Suspense } from 'react';

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Confirm />
    </Suspense>
  );
}
