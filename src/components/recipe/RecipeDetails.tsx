'use client';

import { Recipe } from '@/types/Recipe';
import { getButtonColorClass } from '@/utils/styles/colorUtils';
import IngredientDisplay from './IngredientDisplay';

interface RecipeDetailsProps {
  recipe: Recipe;
}

const RecipeDetails = ({ recipe }: RecipeDetailsProps) => (
  <>
    <h1 className='text-4xl font-bold flex flex-row flex-wrap justify-start'>
      {recipe?.title}
      {(recipe?.tags?.length ?? 0) > 0 &&
        recipe?.tags?.map((tag, index) => (
          <div
            className={`ml-2 px-4 py-1 rounded-full min-w-10 text-sm flex items-center justify-center ${getButtonColorClass(
              recipe?.color,
              false
            )}`}
            key={index}
          >
            {tag}
          </div>
        ))}
    </h1>
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
        <IngredientDisplay key={ingredient.id} ingredient={ingredient} />
      ))}
    </ul>
    <strong className='text-lg'>Directions:</strong>
    <ul className='list-disc ml-4'>
      {recipe?.directions?.map((direction) => (
        <li key={direction?.id}>{direction?.content}</li>
      ))}
    </ul>
  </>
);

export default RecipeDetails;
