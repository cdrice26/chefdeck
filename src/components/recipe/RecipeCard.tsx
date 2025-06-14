import React from 'react';
import Card from '../ui/Card';
import { Recipe } from '@/types/Recipe';
import Button from '../forms/Button';
import { getColorClass, getButtonColorClass } from '@/utils/colorUtils';
import Image from 'next/image';

interface RecipeProps {
  recipe: Recipe;
  onClick: (id: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>, id: string) => void;
  onImageLoad: (id: string) => void;
}

/**
 * A recipe card for the grid, with the title, image, and a "Details" button
 * @param {Object} props
 * @returns A card representing a recipe
 */
const RecipeCard = ({
  recipe,
  onClick,
  onImageError,
  onImageLoad
}: RecipeProps) => {
  return (
    <Card
      className={`flex flex-col items-center justify-between py-4 gap-4 relative ${getColorClass(
        recipe?.color
      )}`}
    >
      <h3 className='p-2 text-xl font-bold'>{recipe?.title}</h3>
      <Image
        loading='lazy'
        src={recipe?.imgUrl ?? '/logo.png'}
        alt=''
        className='w-full h-[300px] object-cover'
        width={500}
        height={300}
        onError={(e) => onImageError(e, recipe?.id)}
        onLoad={() => onImageLoad(recipe?.id)}
      />
      <div className='flex flex-row flex-wrap gap-4'>
        {recipe?.tags &&
          recipe?.tags?.map((tag, index) => (
            <div
              key={index}
              className={`${getButtonColorClass(
                recipe?.color,
                false
              )} rounded-full min-w-10 p-3 flex justify-center items-center`}
            >
              {tag}
            </div>
          ))}
      </div>
      <Button
        className={getButtonColorClass(recipe?.color)}
        onClick={() => onClick(recipe?.id)}
      >
        Details
      </Button>
    </Card>
  );
};

export default RecipeCard;
