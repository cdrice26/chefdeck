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
    'width': '100%',
    'flexWrap': 'nowrap',
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    '&:hover': {
      borderColor: isRounded ? 'none' : isDarkMode ? 'white' : 'black'
    },
    'whiteSpace': 'nowrap',
    'overflow': 'hidden',
    'textOverflow': 'ellipsis'
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    gap: 4
  }),
  input: (provided: any) => ({
    ...provided,
    color: isDarkMode ? 'white' : 'black',
    flexGrow: 1, // allow input to grow
    flexShrink: 1, // allow input to shrink
    flexBasis: '60px', // allow input to shrink to fit content
    minWidth: minWidth, // allow shrinking to 0 if needed
    width: 'auto', // <--- Prevents input from being forced to 100%,
    display: 'flex',
    alignItems: 'center'
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: isDarkMode ? '#444' : '#e0e0e0',
    flexShrink: 1, // <--- Allow tags to shrink
    minWidth: 0, // <--- Allow tags to shrink to zero if needed
    maxWidth: '100%'
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
  noOptionsMessage: (provided: any) => ({
    ...provided,
    color: isDarkMode ? 'white' : 'black' // No options message color
  }),
  loadingMessage: (provided: any) => ({
    ...provided,
    color: isDarkMode ? 'white' : 'black' // Loading message color
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: isDarkMode ? '#333' : 'white',
    color: isDarkMode ? 'white' : 'black',
    zIndex: 1000 // Ensure the menu appears above other elements
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
