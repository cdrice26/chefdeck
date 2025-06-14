export type Color =
  | 'white'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'orange';

/**
 * Check if the provided string is a valid color
 * @param color - Color to check
 * @returns Boolean - true if valid, false if invalid
 */
export const isValidColor = (color: string): color is Color =>
  ['white', 'blue', 'green', 'red', 'yellow', 'purple', 'orange'].includes(
    color
  );

/**
 * Get the tailwind classes for a given color
 * @param color - The color to get the classes for
 * @returns The classes given the color
 */
export const getColorClass = (color: Color) => {
  switch (color) {
    case 'white':
      return 'bg-white-normal dark:bg-white-normal-dark';
    case 'blue':
      return 'bg-blue-normal dark:bg-blue-normal-dark';
    case 'green':
      return 'bg-green-normal dark:bg-green-normal-dark';
    case 'red':
      return 'bg-red-normal dark:bg-red-normal-dark';
    case 'yellow':
      return 'bg-yellow-normal dark:bg-yellow-normal-dark';
    case 'purple':
      return 'bg-purple-normal dark:bg-purple-normal-dark';
    case 'orange':
      return 'bg-orange-normal dark:bg-orange-normal-dark';
    default:
      return '';
  }
};

/**
 * Gets the button tailwind classes for a given color
 * @param color - The color to get the classes for
 * @param includeHover - Whether to include hover classes
 * @returns The button classes given the color
 */
export const getButtonColorClass = (
  color: Color,
  includeHover: boolean = true
) => {
  // Define an array of color objects with base and hover classes separated
  const colors = [
    {
      name: 'white',
      base: 'bg-button-white-normal dark:bg-button-white-normal-dark',
      hover: 'hover:bg-button-white-hover dark:hover:bg-button-white-hover-dark'
    },
    {
      name: 'yellow',
      base: 'bg-button-yellow-normal dark:bg-button-yellow-normal-dark',
      hover:
        'hover:bg-button-yellow-hover dark:hover:bg-button-yellow-hover-dark'
    },
    {
      name: 'green',
      base: 'bg-button-green-normal dark:bg-button-green-normal-dark',
      hover: 'hover:bg-button-green-hover dark:hover:bg-button-green-hover-dark'
    },
    {
      name: 'blue',
      base: 'bg-button-blue-normal dark:bg-button-blue-normal-dark',
      hover: 'hover:bg-button-blue-hover dark:hover:bg-button-blue-hover-dark'
    },
    {
      name: 'purple',
      base: 'bg-button-purple-normal dark:bg-button-purple-normal-dark',
      hover:
        'hover:bg-button-purple-hover dark:hover:bg-button-purple-hover-dark'
    },
    {
      name: 'red',
      base: 'bg-button-red-normal dark:bg-button-red-normal-dark',
      hover: 'hover:bg-button-red-hover dark:hover:bg-button-red-hover-dark'
    },
    {
      name: 'orange',
      base: 'bg-button-orange-normal dark:bg-button-orange-normal-dark',
      hover:
        'hover:bg-button-orange-hover dark:hover:bg-button-orange-hover-dark'
    }
  ];
  const colorObj = colors.find((c) => c.name === color);
  if (!colorObj) return '';
  return includeHover ? `${colorObj.base} ${colorObj.hover}` : colorObj.base;
};
