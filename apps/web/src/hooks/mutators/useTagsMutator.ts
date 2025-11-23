import { NotificationKind } from '@/context/NotificationContext';
import RequestFn from '@/types/RequestFn';

export interface TagsMutator {
  handleDelete: (tagValue: string) => Promise<void>;
}

/**
 * Hook for handling tag mutations.
 *
 * @param request - Function to make a request
 * @param addNotification - Function to add a notification
 * @param refetch - Function to refetch data
 * @returns An object with the following properties:
 * - handleDelete: Function to handle tag deletion
 */
const useTagsMutator = (
  request: RequestFn,
  addNotification: (message: string, type: NotificationKind) => void,
  refetch: () => void
): TagsMutator => {
  const handleDelete = async (tagValue: string) => {
    const resp = await request(
      `/api/tags/delete?tagValue=${encodeURIComponent(tagValue)}`,
      'DELETE'
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

  return { handleDelete };
};

export default useTagsMutator;
