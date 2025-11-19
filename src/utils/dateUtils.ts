/**
 * Get the number of days in a specific month of a year.
 *
 * @param year - The full year (for example, 2025).
 * @param monthIndex - Zero-based month index (0 = January, 11 = December).
 * @returns The number of days in the specified month.
 * @throws Error if `monthIndex` is not between 0 and 11.
 */
export const getDaysInMonth = (year: number, monthIndex: number) => {
  // Check if the month index is valid
  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error('Month index must be between 0 and 11.');
  }

  // Create a date object for the last day of the requested month by
  // asking for day 0 of the following month.
  const date = new Date(year, monthIndex + 1, 0); // Year is provided by the caller
  return date.getDate(); // Get the number of days in the month
};

/**
 * Generate an array of Date objects representing every day in the inclusive range.
 *
 * @param startDate - The inclusive start date.
 * @param endDate - The inclusive end date.
 * @returns An array of Date instances for each day from `startDate` to `endDate`.
 */
export const getDatesBetween = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const dateCount =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Calculate the number of days

  return Array.from({ length: dateCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index); // Increment the date by index
    return date;
  });
};

/**
 * Month lookup array mapping 0-based month indices to human-readable labels.
 *
 * Useful for month selectors and display purposes.
 */
export const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];
