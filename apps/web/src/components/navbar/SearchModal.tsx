import React from 'react';
import { Button, Modal } from 'chefdeck-shared';
import SearchBarRenderer from '../navbar/SearchBarRenderer';

interface TagOption {
  label: string;
  value: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (e: string) => void;
  tags: TagOption[];
  onChangeTags: (tags: TagOption[]) => void;
  tagOptions: TagOption[];
}

/**
 * SearchModal component.
 *
 * A mobile-oriented modal wrapper that displays a full search UI using
 * `SearchBarRenderer`. The component is controlled via `isOpen` and renders
 * nothing when closed. It accepts the current `query` and `tags` as props and
 * notifies the parent when the user types or changes the selected tags.
 *
 * Behavior:
 * - Uses the `usePortal` prop on `Modal` so the search UI is rendered in a portal.
 * - Delegates text input handling to `handleInputChange` and maps the select's
 *   create/clear actions to `onQueryChange` and `onChangeTags`.
 * - Calls `onClose` when the select blurs or when the Close button is pressed.
 *
 * Props:
 * - `isOpen` (boolean): Whether the modal is visible.
 * - `onClose` (function): Callback to close the modal.
 * - `query` (string): Controlled input value for the search field.
 * - `onQueryChange` (function): Called with the new query string when the user types.
 * - `tags` (TagOption[]): Currently selected tag options.
 * - `onChangeTags` (function): Called with the updated tag array when selection changes.
 * - `tagOptions` (TagOption[]): Available tag options to display in the select.
 *
 * @param {SearchModalProps} props - Component props.
 * @returns {JSX.Element | null} The modal containing the search UI or null when closed.
 */
const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  tags,
  onChangeTags,
  tagOptions
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      usePortal
      className="bg-white dark:bg-[#222] w-[90%] justify-center items-center overflow-y-auto"
    >
      <SearchBarRenderer
        query={query}
        selectValue={tags}
        tagOptions={tagOptions}
        handleInputChange={(input, meta) => {
          if (meta.action === 'input-change') onQueryChange(input);
        }}
        handleChange={(selected, actionMeta) => {
          if (actionMeta.action === 'clear') {
            onChangeTags([]);
            onQueryChange('');
            return;
          }
          onChangeTags(selected as TagOption[]);
        }}
        onBlur={onClose}
        usePortal
      />
      <Button onClick={onClose}>Close</Button>
    </Modal>
  );
};

export default SearchModal;
