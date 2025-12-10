import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { zipArrays } from 'chefdeck-shared';

type RequestFn = (
  url: string,
  method: string,
  body?: FormData | object
) => Promise<Response>;

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
  const image = formData.get('filePath') as string | null;
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

export const request: RequestFn = async (url, _method, body) => {
  const result = await invoke(
    url.replace('/', '_'),
    (body as InvokeArgs) ?? {}
  );
  return result as any;
  // any is necessary because the RequestFn type is borrowed from the original web app which
  // uses HTTP requests and this does not so we can't typecheck this without weakening
  // typechecking on the web version.
};

export const requestFromFormData: RequestFn = async (url, _method, body) => {
  if (!(body instanceof FormData)) {
    throw new Error('Body must be a FormData object');
  } else {
    const recipeObj = getRecipeUpdateData(body);
    return request(url, _method, recipeObj);
  }
};
