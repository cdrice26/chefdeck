import React, { useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { MultiValue, ActionMeta } from 'react-select';
import SearchModal from '@/components/specificForms/SearchModal';
import useAvailableTags from '@/hooks/useAvailableTags';
import SearchBarRenderer from './SearchBarRenderer';
import Tab from './Tab';

interface TagOption {
  label: string;
  value: string;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (e: string) => void;
  onBlur: () => void;
  tags?: TagOption[];
  onChangeTags?: (tags: TagOption[]) => void;
}

/**
 * SearchBar component.
 *
 * A responsive search UI that renders a multi-select search input for desktop
 * and a compact search icon that opens a modal on mobile. The component manages
 * a modal state for mobile usage and delegates the actual select rendering to
 * `SearchBarRenderer` and the modal to `SearchModal`.
 *
 * Behavior:
 * - `query` is the current text input for searching and is reflected in the
 *   select's `inputValue`.
 * - `tags` represents selected tag filters and is supplied as the select value.
 * - `onQueryChange` is called when the user types into the input (debouncing/URL updates
 *   are handled by parent components).
 * - `onChangeTags` is called with the new tag array when the selection changes.
 * - `onBlur` is called when the search input loses focus or the modal closes.
 *
 * @param {SearchBarProps} props - Component properties.
 * @param {string} props.query - Current search query string.
 * @param {(e: string) => void} props.onQueryChange - Called when the query changes.
 * @param {() => void} props.onBlur - Called when the search input is blurred/closed.
 * @param {TagOption[]} [props.tags] - Currently selected tags.
 * @param {(tags: TagOption[]) => void} [props.onChangeTags] - Callback when selected tags change.
 * @returns {JSX.Element} The search UI (desktop select + mobile modal).
 *
 * @example
 * // <SearchBar query={q} onQueryChange={setQ} onBlur={handleBlur} tags={tags} onChangeTags={setTags} />
 */
const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onBlur,
  tags = [],
  onChangeTags = () => {}
}) => {
  const { availableTags: tagOptions, isLoading, error } = useAvailableTags();

  const [isModalOpen, setModalOpen] = useState(false);

  // Only tags are in the value, never the query
  const selectValue = useMemo(() => tags ?? [], [tags]);

  // When a tag is selected, remove its text from the query if present
  const handleChange = (
    selected: MultiValue<TagOption>,
    actionMeta: ActionMeta<TagOption>
  ) => {
    if (actionMeta.action === 'clear') {
      onChangeTags([]);
      onQueryChange('');
      return;
    }
    onChangeTags(selected as TagOption[]);
  };

  const handleInputChange = (input: string, { action }: { action: string }) => {
    // Only update query when user types (not when selecting/clearing)
    if (action === 'input-change') {
      onQueryChange(input);
    }
  };

  const handleIconClick = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    onBlur();
  };

  return (
    <div>
      {/* Desktop Search Bar */}
      <div className="hidden xl:flex w-full">
        <SearchBarRenderer
          tagOptions={error || isLoading ? [] : tagOptions}
          selectValue={selectValue}
          query={query}
          handleInputChange={handleInputChange}
          handleChange={handleChange}
          onBlur={onBlur}
        />
      </div>

      {/* Mobile Search Icon */}
      <div className="xl:hidden text-gray-500">
        <Tab
          onClick={handleIconClick}
          label="Search"
          icon={<IoSearch />}
          isActive={false}
        ></Tab>
      </div>

      {/* Modal for Search Input */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        query={query}
        onQueryChange={onQueryChange}
        tags={tags}
        onChangeTags={onChangeTags}
        tagOptions={tagOptions}
      />
    </div>
  );
};

export default SearchBar;
