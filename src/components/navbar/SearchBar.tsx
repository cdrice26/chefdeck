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

const SearchBar = ({
  query,
  onQueryChange,
  onBlur,
  tags = [],
  onChangeTags = () => {}
}: SearchBarProps) => {
  const tagOptions = useAvailableTags();

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

    let newQuery = query;
    (selected as TagOption[]).forEach((tag) => {
      // Remove any word in the query that is a prefix of the tag label (case-insensitive)
      newQuery = newQuery
        .split(/\s+/)
        .filter((word) => {
          // Keep the word if it is NOT a prefix of the tag label
          return !tag.label.toLowerCase().startsWith(word.toLowerCase());
        })
        .join(' ');
    });
    newQuery = newQuery.replace(/\s+/g, ' ').trim();

    onChangeTags(selected as TagOption[]);
    onQueryChange(newQuery);
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
      <div className='hidden xl:flex w-full'>
        <SearchBarRenderer
          tagOptions={tagOptions}
          selectValue={selectValue}
          query={query}
          handleInputChange={handleInputChange}
          handleChange={handleChange}
          onBlur={onBlur}
        />
      </div>

      {/* Mobile Search Icon */}
      <div className='xl:hidden text-gray-500'>
        <Tab
          onClick={handleIconClick}
          label='Search'
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
