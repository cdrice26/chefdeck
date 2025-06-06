export default async function asyncMap(
  array: any[],
  asyncCallback: (item: any) => Promise<any>
): Promise<any[]> {
  const promises = array.map(asyncCallback);
  return Promise.all(promises);
}
