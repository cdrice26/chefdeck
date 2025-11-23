interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  [props: string]: any;
}

/**
 * Button component.
 *
 * A small presentational button wrapper that applies default styling unless a
 * background class (e.g. `bg-...`) is provided via `className`. All other props
 * are forwarded to the underlying `<button>` element (e.g. `onClick`, `type`).
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Content to render inside the button.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {Object} [props.props] - Any other button attributes/props to be forwarded.
 * @returns {JSX.Element} A styled button element.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      tabIndex={0}
      className={`${
        !className.includes('bg-')
          ? 'bg-blue-500 hover:bg-blue-700 text-white'
          : ''
      } font-bold py-2 px-4 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
