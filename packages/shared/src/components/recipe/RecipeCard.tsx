import React from 'react';
import Card from '../ui/Card';
import { Recipe } from '@/types/Recipe';
import Button from '../forms/Button';
import { getColorClass, getButtonColorClass } from '@/utils/styles/colorUtils';

interface RecipeProps {
  recipe: Recipe;
  onClick: (id: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>, id: string) => void;
  onImageLoad: (id: string) => void;
}

/**
 * RecipeCard component.
 *
 * Presentational card that displays a recipe's title, image, tags, and a "Details" button.
 *
 * Props:
 * - `recipe` (Recipe): The recipe object to render. Expected fields include `id`, `title`, `imgUrl`, `tags`, and `color`.
 * - `onClick` ((id: string) => void): Callback invoked when the Details button is clicked; receives the recipe id.
 * - `onImageError` ((e, id) => void): Invoked when the recipe image fails to load; receives the image event and recipe id.
 * - `onImageLoad` ((id) => void): Invoked when the recipe image successfully loads; receives the recipe id.
 *
 * This component is purely presentational and forwards user interactions (button click, image events)
 * to the provided callbacks so parent components can handle navigation or retry logic.
 *
 * @param {RecipeProps} props - Component props.
 * @returns {JSX.Element} The rendered recipe card.
 */
const RecipeCard: React.FC<RecipeProps> = ({
  recipe,
  onClick,
  onImageError,
  onImageLoad
}) => {
  return (
    <Card
      className={`flex flex-col items-center justify-between py-4 gap-4 relative ${getColorClass(
        recipe?.color
      )}`}
    >
      <h3 className="p-2 text-xl font-bold">{recipe?.title}</h3>
      <img
        loading="lazy"
        src={recipe?.imgUrl ?? '/logo-icononly.png'}
        alt=""
        className="w-full h-[300px] object-cover"
        width={500}
        height={300}
        onError={(e) => onImageError(e, recipe?.id)}
        onLoad={() => onImageLoad(recipe?.id)}
      />
      <div className="flex flex-row flex-wrap gap-4">
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
