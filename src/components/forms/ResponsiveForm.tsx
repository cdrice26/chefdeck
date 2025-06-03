import Card from '../ui/Card';

interface ResponsiveFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

/**
 * ResponsiveForm component.
 *
 * A responsive form wrapper that centers the form on the page and applies consistent styling.
 *
 * @component
 * @param {ResponsiveFormProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered responsive form.
 */
const ResponsiveForm = ({ onSubmit, children }: ResponsiveFormProps) => (
  <div className='w-full h-full flex justify-center items-center'>
    <Card className='p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto'>
      <form onSubmit={onSubmit} className='flex flex-col gap-4'>
        {children}
      </form>
    </Card>
  </div>
);

export default ResponsiveForm;
