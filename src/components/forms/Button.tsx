const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [props: string]: any;
}) => {
  return (
    <button
      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
