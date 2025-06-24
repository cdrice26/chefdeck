'use client';

import useIsDark from '@/hooks/useIsDark';
import { useState } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

interface UserDropdownProps {
  user: { email: string; username?: string } | null;
  onClickAccount: () => void;
  onClickLogout: () => void;
}

const userDropdownStyles: (
  isDark: boolean
) => StylesConfig<OptionType, false> = (isDark) => ({
  control: (base, state) => ({
    ...base,
    minWidth: 120,
    borderRadius: '9999px', // rounded-full
    padding: '0.5rem 1.5rem', // p-4 px-6
    backdropFilter: 'blur(8px)',
    backgroundColor: state.isFocused
      ? isDark
        ? 'rgba(34, 34, 34, 0.75)'
        : 'rgba(229, 231, 235, 0.75)' // dark:hover:bg-[#333] or hover:bg-gray-200
      : isDark
      ? 'rgba(34, 34, 34, 0.75)'
      : 'rgba(243, 244, 246, 0.75)', // dark:bg-[#222] or bg-gray-100
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', // shadow-md
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    color: isDark ? '#f3f4f6' : '#111827'
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    marginTop: 4,
    paddingTop: 6,
    paddingBottom: 6,
    backdropFilter: 'blur(8px)',
    backgroundColor: isDark
      ? 'rgba(34, 34, 34, 0.75)'
      : 'rgba(255, 255, 255, 0.75)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: isDark ? '#f3f4f6' : '#111827'
  }),
  option: (
    provided: any,
    state: { isFocused: boolean; isSelected: boolean }
  ) => ({
    ...provided,
    'backgroundColor': state.isFocused
      ? isDark
        ? 'rgba(85, 85, 85, 0.5)'
        : 'rgba(240, 240, 240, 0.5)' // Background color when focused
      : 'transparent', // Background color when not focused
    'color': state.isSelected
      ? 'white' // Text color when selected
      : state.isFocused
      ? isDark
        ? 'white'
        : 'black' // Text color when focused
      : isDark
      ? 'white'
      : 'black', // Text color when not focused
    ':active': {
      backgroundColor: state.isFocused
        ? isDark
          ? '#555'
          : '#f0f0f0'
        : isDark
        ? '#333'
        : 'white'
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: isDark ? '#d1d5db' : '#6b7280',
    fontWeight: 500
  }),
  singleValue: (base) => ({
    ...base,
    color: isDark ? '#f3f4f6' : '#111827',
    fontWeight: 500
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: isDark ? '#d1d5db' : '#6b7280'
  })
});

const UserDropdown = ({
  user,
  onClickAccount,
  onClickLogout
}: UserDropdownProps) => {
  const options: OptionType[] = [
    { value: 'Account', label: 'Account' },
    { value: 'Logout', label: 'Logout' }
  ];

  // Show user's email/username as placeholder
  const placeholder = user?.username ?? user?.email ?? 'User';

  const isDark = useIsDark();

  const [selectedOption, setSelectedOption] =
    useState<SingleValue<OptionType>>(null);

  const handleChange = (option: SingleValue<OptionType>) => {
    setSelectedOption(null); // Reset after selection
    if (!option) return;
    if (option.value === 'Account') onClickAccount();
    if (option.value === 'Logout') onClickLogout();
  };

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable={false}
      menuPlacement='bottom'
      styles={userDropdownStyles(isDark)}
    />
  );
};

export default UserDropdown;
