/**
 * Card component.
 *
 * A presentational container that applies default background and border styles
 * unless a background class is provided via `className`. When `squareOnMobile`
 * is true the card uses square appearance on small screens and applies a subtle
 * border/shadow on larger viewports; otherwise it uses rounded corners and a standard shadow.
 *
 * Props:
 * - children: React.ReactNode - content rendered inside the card.
 * - className?: string - additional Tailwind classes to apply.
 * - squareOnMobile?: boolean - toggle square styling on mobile.
 *
 * @param {CardProps} props - Component props.
 * @returns {JSX.Element} The card wrapper element.
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  squareOnMobile?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  squareOnMobile = false
}) => {
  return (
    <div
      className={`${className} ${
        !className?.includes('bg-') ? 'bg-white dark:bg-[#222]' : ''
      } ${
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
