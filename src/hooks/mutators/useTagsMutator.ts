import { NotificationKind } from '@/context/NotificationContext';
import request from '@/utils/fetchUtils';

export interface TagsMutator {
  handleDelete: (tagValue: string) => Promise<void>;
}

/**
 * Hook for handling tag mutations.
 *
 * @param addNotification - Function to add a notification
 * @param refetch - Function to refetch data
 * @returns An object with the following properties:
 * - handleDelete: Function to handle tag deletion
 */
const useTagsMutator = (
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
