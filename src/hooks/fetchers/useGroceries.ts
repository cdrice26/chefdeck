import { NotificationKind } from '@/context/NotificationContext';
import { Ingredient } from '@/types/Recipe';
import RequestFn from '@/types/RequestFn';
import { useState } from 'react';

export interface GroceriesFetcher {
  groceries: Ingredient[];
  handleGroceriesRequest: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
}

/**
 * A hook for fetching and managing the user's groceries.
 *
 * @param request - The request function to use for fetching data.
 * @param addNotification - Function to add a notification
 * @returns an object containing the following properties:
 * - groceries: An array of Ingredient objects representing the user's groceries.
 * - handleGroceriesRequest: A function that handles the request for groceries.
 */
const useGroceries = (
  request: RequestFn,
  addNotification: (message: string, type: NotificationKind) => void
): GroceriesFetcher => {
  const [groceries, setGroceries] = useState<Ingredient[]>([]);

  const handleGroceriesRequest = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fromDate = formData.get('fromDate') as string;
    const toDate = formData.get('toDate') as string;
    if (new Date(fromDate) > new Date(toDate)) {
      addNotification('From date must be before to date.', 'error');
      return;
    }
    const resp = await request(
      `/api/groceries?fromDate=${fromDate}&toDate=${toDate}`,
      'GET'
    );
    if (!resp.ok) {
      const json = await resp.json();
      addNotification(json.error.message, 'error');
      return;
    }
    const json = await resp.json();
    setGroceries(
      json.data.sort((a: Ingredient, b: Ingredient) =>
        a.name.localeCompare(b.name)
      )
    );
  };

  return {
    groceries,
    handleGroceriesRequest
  };
};

export default useGroceries;
