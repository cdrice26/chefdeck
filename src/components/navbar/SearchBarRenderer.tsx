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

/**
 * SearchBarRenderer component.
 *
 * Renders the react-select multi-select input used by `SearchBar`. The component
 * accepts a controlled `inputValue` for free-text searching and a set of tag
 * options to choose from. Filtering behavior is customized so that a tag is
 * shown if any word from the input matches the tag label (case-insensitive,
 * partial match).
 *
 * Props:
 * - tagOptions: available tag options to display in the dropdown.
 * - selectValue: currently selected tag options.
 * - query: current input value for the select's input.
 * - handleInputChange: called when the user types into the input.
 * - handleChange: called when the selected options change.
 * - onBlur: called when the select loses focus.
 * - usePortal: optional flag to render the menu in a portal (defaults to false).
 *
 * @param {SearchBarRendererProps} props - Component props.
 * @returns {JSX.Element} The rendered Select component.
 */
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
      placeholder="Search or select tags..."
      classNamePrefix="react-select"
      className="w-full"
      styles={getSelectStyles(isDark, true, '300px')}
      components={{
        DropdownIndicator: () => <IoSearch className="mx-2 text-gray-400" />
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
