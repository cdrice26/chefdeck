import React from 'react';
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
 * Props:
 * - `onSubmit` (function): Form submit handler that receives the submit event.
 * - `children` (React.ReactNode): The form fields and content to render inside the form.
 *
 * @component
 * @param {ResponsiveFormProps} props - The properties for the component.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} props.onSubmit - The form submit handler.
 * @param {React.ReactNode} props.children - The form's children to render.
 * @returns {JSX.Element} The rendered responsive form element.
 *
 * @example
 * // <ResponsiveForm onSubmit={handleSubmit}>
 * //   <Input name="title" />
 * // </ResponsiveForm>
 */
const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  onSubmit,
  children
}) => (
  <div className="w-full h-full flex justify-center items-center m-0 sm:m-4">
    <Card
      className="p-4 w-full h-full sm:w-1/2 sm:min-h-1/2 sm:h-auto"
      squareOnMobile
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 relative">
        {children}
      </form>
    </Card>
  </div>
);

export default ResponsiveForm;
