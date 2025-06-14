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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Detect system color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    // Set initial value
    setIsDarkMode(mediaQuery.matches);

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleChange = (newValue: MultiValue<OptionType> | null) => {
    const selected = (newValue as OptionType[]) || [];
    onChange(selected); // Notify parent of the change
  };

  const handleCreate = (inputValue: string) => {
    const newOption: OptionType = { value: inputValue, label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    onChange([...value, newOption]); // Notify parent of the new option
  };

  // Define custom styles based on the color scheme
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      'backgroundColor': isDarkMode ? '#333' : 'white',
      'color': isDarkMode ? 'white' : 'black',
      '&:hover': {
        borderColor: isDarkMode ? 'white' : 'black'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#333' : 'white'
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#444' : '#e0e0e0' // Adjust for selected items
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // Text color for selected items
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      'color': isDarkMode ? 'white' : 'black', // Text color for remove button
      '&:hover': {
        backgroundColor: isDarkMode ? '#d9534f' : '#d9534f', // Hover color
        color: 'white' // Text color on hover
      }
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // Placeholder text color
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // Single selected value text color
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // Input text color
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // No options message color
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black' // Loading message color
    }),
    option: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      'backgroundColor': state.isFocused
        ? isDarkMode
          ? '#555'
          : '#f0f0f0'
        : isDarkMode
        ? '#333'
        : 'white',
      'color': state.isFocused ? 'black' : isDarkMode ? 'white' : 'black', // Ensure black text in light mode
      '&:active': {
        backgroundColor: state.isFocused
          ? isDarkMode
            ? '#555'
            : '#f0f0f0'
          : isDarkMode
          ? '#333'
          : 'white'
      },
      '&:hover': {
        backgroundColor: state.isFocused
          ? isDarkMode
            ? '#555'
            : '#f0f0f0'
          : isDarkMode
          ? '#333'
          : 'white',
        color: 'black' // Ensure black text on hover in light mode
      }
    })
  };

  return (
    <label className='flex flex-row items-center gap-3'>
      Tags:
      <CreatableSelect
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        onCreateOption={handleCreate}
        className='flex-grow'
        placeholder='Select or create options...'
        styles={customStyles} // Apply custom styles here
      />
    </label>
  );
};

export default TagSelector;
