export const getDaysInMonth = (year: number, monthIndex: number) => {
  // Check if the month index is valid
  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error('Month index must be between 0 and 11.');
  }

  // Create a date object for the first day of the next month
  const date = new Date(year, monthIndex + 1, 0); // Year is arbitrary, using 2025
  return date.getDate(); // Get the number of days in the month
};

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
