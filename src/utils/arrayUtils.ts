/**
 * Map an array with an asynchronous callback and wait for all results.
 *
 * @param array - The array of items to map over.
 * @param asyncCallback - An async function that receives an item and returns a Promise of the mapped value.
 * @returns A Promise that resolves to an array containing the results of the asyncCallback for each item.
 */
export const asyncMap = async (
  array: any[],
  asyncCallback: (item: any) => Promise<any>
): Promise<any[]> => {
  const promises = array.map(asyncCallback);
  return Promise.all(promises);
};

/**
 * Zip three parallel arrays (names, amounts, units) into an array of objects.
 *
 * Each result object has the shape: { name, amount, unit, sequence } where
 * `amount` is parsed from the corresponding string in the `amounts` array.
 *
 * @param names - Array of names (e.g., ingredient names).
 * @param amounts - Array of amount strings (will be parsed to numbers).
 * @param units - Array of unit strings.
 * @returns An array of objects combining the inputs with a `sequence` index.
 */
export const zipArrays = (
  names: string[],
  amounts: string[],
  units: string[]
) => {
  const maxLength = Math.max(names.length, amounts.length, units.length);
  return Array.from({ length: maxLength }, (_, index) => ({
    name: names[index],
    amount: parseFloat(amounts[index]) ?? 0,
    unit: units[index],
    sequence: index + 1
  }));
};
