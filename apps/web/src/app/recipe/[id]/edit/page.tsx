'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import request from '@/utils/fetchUtils';
import {
  useRecipe,
  useNotification,
  useRecipeEditMutator,
  RecipeForm,
  OptionType
} from 'chefdeck-shared';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';

const TagSelector = dynamic(
  () => import('chefdeck-shared').then((module) => module.TagSelector),
  {
    ssr: false
  }
) as React.FC<{
  value: OptionType[];
  onChange: React.Dispatch<React.SetStateAction<OptionType[]>>;
  initialOptions: OptionType[];
}>;

export default function EditRecipePage() {
  const router = useRouter();
  useRequireAuth(request, router.replace);
  const { id } = useParams() as { id: string };
  const { recipe, isLoading, error } = useRecipe(request, id as string);
  const { addNotification } = useNotification();

  const mutator = useRecipeEditMutator(
    request,
    router.push,
    addNotification,
    id
  );

  return (
    <RecipeForm
      {...mutator}
      request={request}
      recipe={error || isLoading ? null : recipe}
      TagSelector={TagSelector}
    />
  );
}
