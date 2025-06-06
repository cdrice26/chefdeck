export const getColorClass = (color: string) => {
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

export const getButtonColorClass = (color: string) => {
  // Define an array of color objects
  const colors = [
    {
      name: 'white',
      classes:
        'bg-button-white-normal hover:bg-button-white-hover dark:bg-button-white-normal-dark dark:hover:bg-button-white-hover-dark'
    },
    {
      name: 'yellow',
      classes:
        'bg-button-yellow-normal hover:bg-button-yellow-hover dark:bg-button-yellow-normal-dark dark:hover:bg-button-yellow-hover-dark'
    },
    {
      name: 'green',
      classes:
        'bg-button-green-normal hover:bg-button-green-hover dark:bg-button-green-normal-dark dark:hover:bg-button-green-hover-dark'
    },
    {
      name: 'blue',
      classes:
        'bg-button-blue-normal hover:bg-button-blue-hover dark:bg-button-blue-normal-dark dark:hover:bg-button-blue-hover-dark'
    },
    {
      name: 'purple',
      classes:
        'bg-button-purple-normal hover:bg-button-purple-hover dark:bg-button-purple-normal-dark dark:hover:bg-button-purple-hover-dark'
    },
    {
      name: 'red',
      classes:
        'bg-button-red-normal hover:bg-button-red-hover dark:bg-button-red-normal-dark dark:hover:bg-button-red-hover-dark'
    },
    {
      name: 'orange',
      classes:
        'bg-button-orange-normal hover:bg-button-orange-hover dark:bg-button-orange-normal-dark dark:hover:bg-button-orange-hover-dark'
    }
  ];
  const colorObj = colors.find((c) => c.name === color);
  return colorObj ? colorObj.classes : '';
};
