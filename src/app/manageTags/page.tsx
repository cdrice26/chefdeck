'use client';

import Button from '@/components/forms/Button';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import { useNotification } from '@/context/NotificationContext';
import useAvailableTags from '@/hooks/fetchers/useAvailableTags';
import { OptionType } from '@/components/forms/TagSelector';

export default function ManageTagsPage() {
  const { availableTags, error, isLoading, refetch } = useAvailableTags();
  const { addNotification } = useNotification();

  const handleDelete = async (tagValue: string) => {
    const resp = await fetch(
      `/api/tags/delete?tagValue=${encodeURIComponent(tagValue)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    refetch();

    if (!resp.ok) {
      const json = await resp.json();
      addNotification('Error deleting tag: ' + json.error.message, 'error');
      return;
    }

    addNotification('Tag successfully deleted.', 'success');
    return;
  };

  return (
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
}
