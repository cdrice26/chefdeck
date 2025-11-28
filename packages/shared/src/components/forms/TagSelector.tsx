import useIsDark from '@/hooks/useIsDark';
import getSelectStyles from '@/utils/styles/getSelectStyles';
import React, { useState, useEffect } from 'react';
import { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';

/**
 * OptionType represents a selectable option for the TagSelector.
 *
 * @property {string} value - The value of the option (used internally / submitted).
 * @property {string} label - The display label shown to the user.
 */
export interface OptionType {
  value: string;
  label: string;
}

/**
 * Props for the TagSelector component.
 *
 * - `initialOptions` optional initial list of available tag options.
 * - `value` controlled array of currently selected options.
 * - `onChange` callback invoked with the new selected array when selection changes.
 */
interface TagSelectorProps {
  initialOptions?: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
}

/**
 * TagSelector component.
 *
 * A creatable multi-select UI for picking or creating tags. The component is
 * controlled via the `value` prop and reports changes through `onChange`.
 * Newly created options are appended to an internal options list so they appear
 * in the dropdown for subsequent selections. Visual styling adapts to dark mode
 * using `useIsDark` and `getSelectStyles`.
 *
 * Behavior:
 * - `initialOptions` seeds the available options and is synchronized when that
 *   prop changes.
 * - `onChange` is called with the selected OptionType[] whenever the selection
 *   changes or a new option is created.
 *
 * @param {TagSelectorProps} props - The component props.
 * @returns {JSX.Element} The rendered creatable multi-select for tags.
 *
 * @example
 * // <TagSelector initialOptions={[{ value: 'italian', label: 'Italian' }]} value={selected} onChange={setSelected} />
 */
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
