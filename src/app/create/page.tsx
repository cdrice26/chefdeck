'use client';

import ResponsiveForm from '@/components/forms/ResponsiveForm';

const CreatePage = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};
  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1>Create Page</h1>
      <p>This is a placeholder for the create page.</p>
    </ResponsiveForm>
  );
};

export default CreatePage;
