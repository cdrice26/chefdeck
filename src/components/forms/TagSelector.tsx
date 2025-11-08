import useIsDark from '@/hooks/useIsDark';
import getSelectStyles from '@/utils/styles/selectStyles';
import React, { useState, useEffect } from 'react';
import { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';

// Define the type for the option
export interface OptionType {
  value: string;
  label: string;
}

// Define the props for the TagSelector component
interface TagSelectorProps {
  initialOptions?: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  initialOptions = [],
  onChange,
  value
}) => {
  const [options, setOptions] = useState<OptionType[]>(initialOptions);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const isDark = useIsDark();

  const handleChange = (newValue: MultiValue<OptionType> | null) => {
    const selected = (newValue as OptionType[]) || [];
    onChange(selected); // Notify parent of the change
  };

  const handleCreate = (inputValue: string) => {
    const newOption: OptionType = { value: inputValue, label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    onChange([...value, newOption]); // Notify parent of the new option
  };

  return (
    <label className="flex flex-col gap-3">
      <div>Tags:</div>
      <CreatableSelect
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        onCreateOption={handleCreate}
        className="flex-grow"
        placeholder="Select or create options..."
        styles={getSelectStyles(isDark)} // Apply custom styles here
      />
    </label>
  );
};

export default TagSelector;
