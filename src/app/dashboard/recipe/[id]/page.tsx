'use client';

import Modal from '@/components/ui/Modal';
import { Recipe } from '@/types/Recipe';
import { getColorClass } from '@/utils/colors/getColorClass';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

export default function RecipePage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const fetchRecipe = async () => {
    const resp = await fetch(`/api/recipe/${id}`);
    const data = await resp.json();
    setRecipe(data?.data?.recipe);
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  return (
    <Modal
      className={`w-full h-full sm:w-[80%] sm:h-[80%] md:w-[70%] lg:w-[60%] z-[100] p-4 ${
        recipe?.color ? getColorClass(recipe?.color) : 'bg-white'
      } relative transition duration-300 justify-start`}
    >
      <button
        className='absolute top-0 right-0 p-4'
        onClick={() => router.push('/dashboard')}
      >
        <IoClose />
      </button>
      {recipe ? (
        <>
          <h1 className='text-4xl font-bold'>{recipe?.title}</h1>
          <ul className='flex flex-row items-center justify-start gap-2'>
            <li>
              <strong>Yield:</strong> {recipe?.servings} Servings
            </li>
            <li>
              <strong>Time:</strong> {recipe?.minutes} Minutes
            </li>
            {recipe?.sourceUrl && (
              <li>
                <strong>Source:</strong>{' '}
                <a href={recipe?.sourceUrl}>{recipe?.sourceUrl}</a>
              </li>
            )}
          </ul>
          {recipe?.imgUrl && (
            <img
              src={recipe?.imgUrl}
              className='max-h-[300px] max-w-[500px] w-auto rounded-lg object-cover'
            />
          )}
          <strong className='text-lg'>Ingredients:</strong>
          <ul className='list-disc ml-4'>
            {recipe?.ingredients?.map((ingredient) => (
              <li key={ingredient?.id}>
                <strong>
                  {ingredient?.amount} {ingredient?.unit}
                </strong>{' '}
                {ingredient?.name}
              </li>
            ))}
          </ul>
          <strong className='text-lg'>Directions:</strong>
          <ul className='list-disc ml-4'>
            {recipe?.directions?.map((direction) => (
              <li key={direction?.id}>{direction?.content}</li>
            ))}
          </ul>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </Modal>
  );
}
