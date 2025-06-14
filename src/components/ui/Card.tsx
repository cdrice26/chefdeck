interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={`${className} ${
        !className?.includes('bg-') ? 'bg-white dark:bg-[#222]' : ''
      } border border-gray-200 rounded-lg shadow dark:border-gray-700`}
    >
      {children}
    </div>
  );
};

export default Card;
