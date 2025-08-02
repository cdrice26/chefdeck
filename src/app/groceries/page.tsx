'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import GroceryList from '@/components/groceries/GroceryList';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Ingredient } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import printComponent from '@/utils/printUtils';
import { useState } from 'react';

const today = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Groceries = () => {
  useRequireAuth();
  const { addNotification } = useNotification();

  const [groceries, setGroceries] = useState<Ingredient[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      printComponent(<GroceryList groceries={groceries} />, 'Print Groceries');
    } catch (e) {
      addNotification(
        "Couldn't print groceries, please try again later.",
        'error'
      );
      return;
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='font-bold text-2xl mb-4'>Grocery List</h1>
      <h1 className='text-red-500'>
        Grocery list generation is currently unavailable. We are currently
        exploring options to restore it.
      </h1>
      <div className='flex flex-col sm:flex-row gap-4 justify-start max-w-lg w-full'>
        <label className='flex flex-row w-full items-center gap-2'>
          <span className='whitespace-nowrap'>From:</span>
          <Input
            type='date'
            name='fromDate'
            className='w-full'
            defaultValue={today()}
          />
        </label>
        <label className='flex flex-row w-full items-center gap-2'>
          <span className='whitespace-nowrap'>To:</span>
          <Input
            type='date'
            name='toDate'
            className='w-full'
            defaultValue={today()}
          />
        </label>
        <Button>Get</Button>
      </div>
      <GroceryList groceries={groceries} />
      {groceries ? <Button onClick={handlePrint}>Print</Button> : <></>}
      <div className='text-xs text-gray-500 mt-4'>
        Grocery list generation depends on WordNet. WordNet is a registered
        trademark of Princeton University. ChefDeck is neither associated with
        nor endorsed by Princeton University.
      </div>
      <div className='text-xs text-gray-500'>
        Princeton University "About WordNet." WordNet. Princeton University.
        2010.
      </div>
    </ResponsiveForm>
  );
};

export default Groceries;
