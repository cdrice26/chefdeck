export const asyncMap = async (
  array: any[],
  asyncCallback: (item: any) => Promise<any>
): Promise<any[]> => {
  const promises = array.map(asyncCallback);
  return Promise.all(promises);
};

export const zipArrays = (
  names: string[],
  amounts: string[],
  units: string[]
) => {
  const maxLength = Math.max(names.length, amounts.length, units.length);
  return Array.from({ length: maxLength }, (_, index) => ({
    name: names[index],
    amount: parseInt(amounts[index]) ?? 0,
    unit: units[index],
    sequence: index + 1
  }));
};
