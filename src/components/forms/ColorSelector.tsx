import React, { useEffect, useState } from 'react';
import Button from './Button';
import {
  Color,
  COLORS,
  getButtonColorClass,
  isValidColor
} from '@/utils/styles/colorUtils';

const ColorSelector = ({ defaultValue }: { defaultValue?: Color }) => {
  const [selectedColor, setSelectedColor] = useState(defaultValue ?? 'white');

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  useEffect(() => {
    if (defaultValue && isValidColor(defaultValue)) {
      setSelectedColor(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      <label className="flex flex-row flex-wrap gap-4 items-center">
        Color:
        {COLORS.map((name) => (
          <Button
            key={name}
            type="button"
            onClick={() =>
              handleColorSelect(isValidColor(name) ? name : 'white')
            }
            className={
              selectedColor === name
                ? `border-black border-2 ${getButtonColorClass(
                    isValidColor(name) ? name : 'white'
                  )} transition-colors duration-200`
                : `${getButtonColorClass(
                    isValidColor(name) ? name : 'white'
                  )} transition-colors duration-200`
            }
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
        ))}
      </label>
      <input type="hidden" name="color" value={selectedColor} />
    </>
  );
};

export default ColorSelector;
