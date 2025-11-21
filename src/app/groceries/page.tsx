'use client';

import GroceryList from '@/components/groceries/GroceryList';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';
import usePrinter from '@/hooks/usePrinter';
import useGroceries from '@/hooks/fetchers/useGroceries';
import Groceries from '@/components/pages/Groceries';

const GroceriesPage = () => {
  const router = useRouter();
  useRequireAuth(router.replace);
  const { addNotification } = useNotification();

  const { groceries, handleGroceriesRequest } = useGroceries(addNotification);

  const handlePrint = usePrinter(
    addNotification,
    <GroceryList groceries={groceries} />
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
