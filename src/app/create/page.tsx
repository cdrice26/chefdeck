'use client';

import RecipeForm from '@/components/specificForms/RecipeForm';

const CreatePage = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};
  return <RecipeForm handleSubmit={handleSubmit} />;
};

export default CreatePage;
