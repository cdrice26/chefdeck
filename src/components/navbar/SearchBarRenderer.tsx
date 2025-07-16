'use client';

import Select, { MultiValue, ActionMeta } from 'react-select';
import { IoSearch } from 'react-icons/io5';
import useIsDark from '@/hooks/useIsDark';
import getSelectStyles from '@/utils/styles/selectStyles';

interface SearchBarRendererProps {
  tagOptions: { label: string; value: string }[];
  selectValue: { label: string; value: string }[];
  query: string;
  handleInputChange: (input: string, { action }: { action: string }) => void;
  handleChange: (
    selected: MultiValue<{ label: string; value: string }>,
    actionMeta: ActionMeta<{ label: string; value: string }>
  ) => void;
  onBlur: () => void;
  usePortal?: boolean;
}

const SearchBarRenderer = ({
  tagOptions,
  selectValue,
  query,
  handleInputChange,
  handleChange,
  onBlur,
  usePortal = false
}: SearchBarRendererProps) => {
  const isDark = useIsDark();

  return (
    <Select
      isMulti
      options={tagOptions}
      value={selectValue}
      inputValue={query}
      onInputChange={handleInputChange}
      onChange={handleChange}
      placeholder='Search or select tags...'
      classNamePrefix='react-select'
      className='w-full'
      styles={getSelectStyles(isDark, true, '300px')}
      components={{
        DropdownIndicator: () => <IoSearch className='mx-2 text-gray-400' />
      }}
      filterOption={(option, input) => {
        // Show tag if ANY word in the input matches the tag label (case-insensitive, partial match)
        if (!input) return true;
        const words = input.split(/\s+/);
        return words.some((word) =>
          option.label.toLowerCase().includes(word.toLowerCase())
        );
      }}
      isClearable
      onBlur={onBlur}
      menuPortalTarget={usePortal ? document.body : undefined}
    />
  );
};

export default SearchBarRenderer;
