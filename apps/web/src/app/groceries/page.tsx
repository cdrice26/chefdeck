'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';
import { useNotification, useGroceries, usePrinter, GroceryList, Groceries } from 'chefdeck-shared';


const GroceriesPage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { addNotification } = useNotification();

  const { groceries, handleGroceriesRequest } = useGroceries(
    request,
    addNotification
  );

  const handlePrint = usePrinter(
    addNotification,
    <GroceryList groceries={groceries} />,
    'Print Groceries'
  );

  return (
    <Groceries
      groceries={groceries}
      handleGroceriesRequest={handleGroceriesRequest}
      handlePrint={handlePrint}
    />
  );
};

export default GroceriesPage;
