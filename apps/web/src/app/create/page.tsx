'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import {
  useRecipeCreator,
  useNotification,
  RecipeForm,
  OptionType
} from 'cookycardz-shared';
import request from '@/utils/fetchUtils';
import dynamic from 'next/dynamic';

const TagSelector = dynamic(
  () => import('cookycardz-shared').then((module) => module.TagSelector),
  {
    ssr: false
  }
) as React.FC<{
  value: OptionType[];
  onChange: React.Dispatch<React.SetStateAction<OptionType[]>>;
  initialOptions: OptionType[];
}>;

const CreatePage = () => {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { addNotification } = useNotification();
  const { handleSubmit } = useRecipeCreator(
    request,
    router.push,
    addNotification
  );
  return (
    <RecipeForm
      request={request}
      handleSubmit={handleSubmit}
      TagSelector={TagSelector}
    />
  );
};

export default CreatePage;
