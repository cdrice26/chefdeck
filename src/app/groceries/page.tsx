'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import IngredientDisplay from '@/components/recipe/IngredientDisplay';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Ingredient } from '@/types/Recipe';
import request from '@/utils/fetchUtils';
import { useState } from 'react';

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
    setGroceries(json.data);
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='font-bold text-2xl mb-4'>Grocery List</h1>
      <div className='flex flex-col sm:flex-row gap-4 justify-start max-w-lg w-full'>
        <label className='flex flex-row w-full items-center gap-2'>
          <span className='whitespace-nowrap'>From:</span>
          <Input type='date' name='fromDate' className='w-full' />
        </label>
        <label className='flex flex-row w-full items-center gap-2'>
          <span className='whitespace-nowrap'>To:</span>
          <Input type='date' name='toDate' className='w-full' />
        </label>
        <Button>Get</Button>
      </div>
      <ul>
        {groceries.map((g, i) => (
          <IngredientDisplay key={i} ingredient={g} />
        ))}
      </ul>
    </ResponsiveForm>
  );
};

export default Groceries;
