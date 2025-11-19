import { zipArrays } from '../utils/arrayUtils';

/**
 * Parse a FormData object from the recipe update form into a plain object.
 *
 * @param formData - The FormData instance produced by the recipe form submission.
 * @returns An object containing parsed recipe fields: title, ingredients, yieldValue, time, image, directions, tags, color, and sourceUrl.
 */
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
  const sourceUrl = formData.get('sourceUrl')?.toString() || null;
  const color = formData.get('color')?.toString() || 'white';

  return {
    title,
    ingredients,
    yieldValue,
    time,
    image,
    directions,
    tags,
    color,
    sourceUrl
  };
};

export default getRecipeUpdateData;
