import { zipArrays } from '../utils/arrayUtils';

const getRecipeUpdateData = (formData: FormData) => {
  const title = formData.get('title')?.toString() || '';
  const ingredientNames = formData.getAll('ingredientNames') as string[];
  const ingredientAmounts = formData.getAll('ingredientAmounts') as string[];
  const ingredientUnits = formData.getAll('ingredientUnits') as string[];
  const yieldValue = parseInt(formData.get('yield')?.toString() ?? '');
  const time = parseInt(formData.get('time')?.toString() ?? '');
  const image = formData.get('image') as File | null;
  const directions = formData.getAll('directions') as string[];
  const tags = formData.getAll('tags[]') as string[];
  const ingredients = zipArrays(
    ingredientNames,
    ingredientAmounts,
    ingredientUnits
  );
  const color = formData.get('color')?.toString() || 'white';

  return {
    title,
    ingredients,
    yieldValue,
    time,
    image,
    directions,
    tags,
    color
  };
};

export default getRecipeUpdateData;
