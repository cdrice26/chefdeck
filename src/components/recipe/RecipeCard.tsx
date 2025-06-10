import React from 'react';
import Card from '../ui/Card';
import { Recipe } from '@/types/Recipe';
import Button from '../forms/Button';
import { getColorClass, getButtonColorClass } from '@/utils/colorUtils';

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
      {recipe?.imgUrl ? (
        <img
          loading='lazy'
          src={recipe?.imgUrl}
          alt=''
          className='w-full'
          onError={(e) => onImageError(e, recipe?.id)}
          onLoad={() => onImageLoad(recipe?.id)}
        />
      ) : (
        <></>
      )}
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
