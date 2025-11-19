import React, { useEffect, useState } from 'react';
import Button from './Button';
import {
  Color,
  COLORS,
  getButtonColorClass,
  isValidColor
} from '@/utils/styles/colorUtils';

/**
 * ColorSelector component.
 *
 * Renders a list of color buttons (based on `COLORS`) and exposes the selected
 * color as a hidden form input named `color`. The component accepts an optional
 * `defaultValue` which will be used to initialize the selection if it is a valid
 * color according to `isValidColor`.
 *
 * Props:
 * - `defaultValue?: Color` - Optional initial color to select.
 *
 * Behavior:
 * - Clicking a color button updates the locally selected color state.
 * - The selected color is kept in a hidden `<input name="color" />` so the value
 *   will be submitted with an enclosing form.
 *
 * @param {{ defaultValue?: Color }} props - Component props.
 * @returns {JSX.Element} The color selector UI and hidden input.
 *
 * @example
 * // <ColorSelector defaultValue="red" />
 */
const ColorSelector: React.FC<{ defaultValue?: Color }> = ({
  defaultValue
}) => {
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
