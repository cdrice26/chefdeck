import {
  Button,
  ManageTags,
  ResponsiveForm,
  useAvailableTags,
  useNotification,
  useTagsMutator
} from 'chefdeck-shared';
import { request } from '../../utils/fetchUtils';

export default function MorePage() {
  const { availableTags, error, isLoading, refetch } =
    useAvailableTags(request);
  const { addNotification } = useNotification();

  const mutator = useTagsMutator(request, addNotification, refetch);

  return (
    <div>
      <ResponsiveForm onSubmit={() => {}}>
        <h1 className="text-2xl font-bold mb-4">Export Recipes</h1>
        <Button>Export All Recipes to Archive</Button>
      </ResponsiveForm>
      <ManageTags
        {...mutator}
        availableTags={availableTags}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}
