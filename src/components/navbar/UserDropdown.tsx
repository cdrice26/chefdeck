'use client';

import useIsDark from '@/hooks/useIsDark';
import { useState } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

interface UserDropdownProps {
  user: { email: string };
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
    backgroundColor: state.isFocused
      ? isDark
        ? '#333'
        : '#e5e7eb' // dark:hover:bg-[#333] or hover:bg-gray-200
      : isDark
      ? '#222'
      : '#f3f4f6', // dark:bg-[#222] or bg-gray-100
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
    backgroundColor: isDark ? '#222' : '#fff',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: isDark ? '#f3f4f6' : '#111827'
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    backgroundColor: state.isFocused
      ? isDark
        ? '#333'
        : '#e5e7eb'
      : isDark
      ? '#222'
      : '#fff',
    color: isDark ? '#f3f4f6' : '#111827',
    cursor: 'pointer'
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
  const placeholder = user?.email ? user.email.split('@')[0] : 'User';

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
