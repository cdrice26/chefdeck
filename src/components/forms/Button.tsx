const Button = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [props: string]: any;
}) => {
  return (
    <button
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
