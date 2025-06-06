import React, { useState } from 'react';
import Button from './Button';

const ColorSelector = () => {
  const [selectedColor, setSelectedColor] = useState('white');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

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

  return (
    <>
      <label className='flex flex-row gap-4 items-center'>
        Color:
        {colors.map(({ name, classes }) => (
          <Button
            key={name}
            type='button'
            onClick={() => handleColorSelect(name)}
            className={
              selectedColor === name
                ? `border-black border-2 ${classes} transition-colors duration-200`
                : `${classes} transition-colors duration-200`
            }
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
        ))}
      </label>
      <input type='hidden' name='color' value={selectedColor} />
    </>
  );
};

export default ColorSelector;
