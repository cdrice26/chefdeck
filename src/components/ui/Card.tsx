interface CardProps {
  children: React.ReactNode;
  className?: string;
  squareOnMobile?: boolean;
}

const Card = ({ children, className, squareOnMobile = false }: CardProps) => {
  return (
    <div
      className={`${className} ${
        !className?.includes('bg-') ? 'bg-white dark:bg-[#222]' : ''
      }  ${
        squareOnMobile
          ? 'sm:rounded-lg sm:shadow sm:border sm:border-gray-200 sm:dark:border-gray-700'
          : 'rounded-lg shadow border border-gray-200 dark:border-gray-700'
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
