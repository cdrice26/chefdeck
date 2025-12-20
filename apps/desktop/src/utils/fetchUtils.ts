import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { zipArrays } from 'chefdeck-shared';

interface IPCResponse {
  json: () => Promise<object>;
  text: () => Promise<string>;
  ok: boolean;
  status: number;
}

type RequestFn = (
  url: string,
  method: string,
  body?: FormData | object
) => Promise<IPCResponse>;

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
  const rawImage = formData.get('filePath') as string | null;
  const image = rawImage === '' ? null : rawImage;
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

/**
 * Converts URLSearchParams to a plain object
 *
 * @param params The URLSearchParams object to parse
 * @returns The params as a plain object
 */
const objectifyParams = (params: URLSearchParams) =>
  Object.fromEntries(params.entries());

/**
 * Takes a url and converts it into a format that can be used for Tauri IPC requests.
 * * Search parameters are converted to a plain object, `params`.
 * * The first numeric path segment is used as the `id` parameter
 *   (this is the only url path parameter used in ChefDeck).
 * * The remaining path segments are joined with underscores to form the `fnName`.
 *
 * @param url The URL to parse
 * @returns The parsed URL components, fnName and params.
 */
const parseUrl = (url: string) => {
  const [base, paramsStr] = url.split('?');
  const paths = base.split('/');
  const id = paths.find((path) => path.match(/^[0-9]+$/));
  const fnName = paths.slice(1).join('_');
  const params = {
    ...(id !== undefined ? { id } : {}),
    ...objectifyParams(new URLSearchParams(paramsStr))
  };
  return { fnName, params };
};

/**
 * Makes Tauri IPC requests
 *
 * @param url - The URL of the corresponding web page. This is used to determine the function name and parameters.
 * @param _method - The HTTP method to use for the request. This is not used in Tauri IPC requests.
 * @param body - The request body. This is converted to a plain object for use in the Tauri IPC request.
 * @returns A promise that resolves to the result of the Tauri IPC request.
 */
export const request: RequestFn = async (url, _method, body) => {
  try {
    const { fnName, params } = parseUrl(url);
    console.log(fnName, params);
    const result = await invoke(fnName, { ...body, ...params } as InvokeArgs);
    return {
      json: () => Promise.resolve(result as object),
      text: () => Promise.resolve((result as object | string).toString()),
      ok: true,
      status: 200
    };
  } catch (error) {
    console.error(error);
    return {
      json: () => Promise.resolve(error as object),
      text: () => Promise.resolve((error as object | string).toString()),
      ok: false,
      status: 500
    };
  }
};

/**
 * Makes Tauri IPC requests from FormData. Specific to recipe creation and update requests at the moment
 * as these are the only requests in ChefDeck that use FormData (required due to the image submissions).
 *
 * @param url - The URL of the corresponding web page. This is used to determine the function name and parameters.
 * @param _method - The HTTP method to use for the request. This is not used in Tauri IPC requests.
 * @param body - The FormData object containing the recipe data.
 * @returns A promise that resolves to the result of the Tauri IPC request.
 */
export const requestFromFormData: RequestFn = async (url, _method, body) => {
  if (!(body instanceof FormData)) {
    throw new Error('Body must be a FormData object');
  } else {
    const recipeObj = getRecipeUpdateData(body);
    return await request(url, _method, recipeObj);
  }
};
