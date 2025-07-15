'use client';

import Dashboard from '@/components/suspendedPages/Dashboard';
import { Suspense } from 'react';

const DashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
};

export default DashboardPage;
