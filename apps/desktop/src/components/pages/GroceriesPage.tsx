import {
  Groceries,
  GroceryList,
  useGroceries,
  useNotification
} from 'cookycardz-shared';
import { request } from '../../utils/fetchUtils';
import usePrinter from '../../hooks/usePrinter';

export default function GroceriesPage() {
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
}
