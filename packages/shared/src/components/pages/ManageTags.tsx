import { TagsMutator } from '@/hooks/mutators/useTagsMutator';
import { OptionType } from '../forms/TagSelector';
import Button from '../forms/Button';
import ResponsiveForm from '../forms/ResponsiveForm';

interface ManageTagsProps extends TagsMutator {
  availableTags: OptionType[];
  error: string | null;
  isLoading: boolean;
}

const ManageTags = ({
  availableTags,
  error,
  isLoading,
  handleDelete
}: ManageTagsProps) => (
  <ResponsiveForm onSubmit={() => {}}>
    <h1 className="text-2xl font-bold mb-4">Manage Tags</h1>
    {error ? (
      <div className="mb-2 shadow-md rounded-md p-4 bg-white dark:bg-[#333] flex flex-row justify-between items-center">
        Error Fetching Tags
      </div>
    ) : isLoading ? (
      <div className="mb-2 shadow-md rounded-md p-4 bg-white dark:bg-[#333] flex flex-row justify-between items-center">
        Loading Tags...
      </div>
    ) : (
      availableTags.map((tag: OptionType) => (
        <div
          key={tag.value}
          className="mb-2 shadow-md rounded-md p-4 bg-white dark:bg-[#333] flex flex-row justify-between items-center"
        >
          <div>{tag.label}</div>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              handleDelete(tag.value);
            }}
            className="bg-red-500 text-white"
          >
            Delete
          </Button>
        </div>
      ))
    )}
  </ResponsiveForm>
);

export default ManageTags;
