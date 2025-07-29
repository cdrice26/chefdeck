'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import { useNotification } from '@/context/NotificationContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import { useRouter } from 'next/navigation';

const CreatePage = () => {
  useRequireAuth();
  const router = useRouter();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const termsAgree = formData.get('termsAgree');
    const url = formData.get('url');
    if (!termsAgree || !url) {
      addNotification(
        'You must agree to the disclaimer and provide a valid url.',
        'error'
      );
      return;
    }
    const resp = await request(
      '/api/recipe/new/fromWeb',
      'post',
      JSON.stringify({ url })
    );
    if (!resp.ok) {
      const json = await resp.json();
      addNotification(json.error.message, 'error');
    }
    const json = await resp.json();
    router.push(`/recipe/${json.data.recipeId}/edit`);
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='font-bold text-2xl'>New Recipe From Web</h1>
      <div className='text-red-500'>
        <strong>DISCLAIMER:</strong> By importing a recipe from the web, you
        certify that you have the appropriate rights to save a copy of the
        recipe via automated means. ChefDeck will display the source URL with
        your imported recipe and you will not be permitted to share it via
        ChefDeck's services to encourage others to obtain it from the original
        source. ChefDeck assumes no responsibility for fraudulent use of this
        service, nor for the content you choose to import.
      </div>
      <label className='flex flex-row gap-2 items-center'>
        <span className='text-nowrap'>I Agree </span>
        <Input type='checkbox' name='termsAgree' value={true} />
      </label>
      <label>
        URL to import from: <Input type='url' name='url' />
      </label>
      <Button>Get Recipe</Button>
    </ResponsiveForm>
  );
};

export default CreatePage;
