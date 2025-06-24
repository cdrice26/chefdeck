// Define custom styles based on the color scheme
const getSelectStyles = (
  isDarkMode: boolean,
  isRounded: boolean = false,
  minWidth: string | null = null
) => ({
  control: (provided: any) => ({
    ...provided,
    'backgroundColor': isDarkMode ? '#333' : 'white',
    'borderColor': isRounded ? 'transparent' : isDarkMode ? 'white' : '#D1D5DB',
    'color': isDarkMode ? 'white' : 'black',
    'borderRadius': isRounded ? '50px' : '4px',
    'minWidth': minWidth,
    '&:hover': {
      borderColor: isRounded ? 'none' : isDarkMode ? 'white' : 'black'
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
    color: isDarkMode ? '#aaa' : '#999' // Placeholder text color
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
});

export default getSelectStyles;
