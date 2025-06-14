import React, { useState } from 'react';
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
  const selectValue: TagOption[] = tags ?? [];

  // When a tag is selected, remove its text from the query if present
  const handleChange = (
    selected: MultiValue<TagOption>,
    actionMeta: ActionMeta<TagOption>
  ) => {
    if (actionMeta.action === 'select-option' && actionMeta.option) {
      const newTag = actionMeta.option as TagOption;
      const tagLabel = newTag.label.trim();

      // Find the substring in the query that matches the tag label and is closest to the cursor (input end)
      // We'll remove the closest match to the end of the input (since that's what react-select matched)
      const lowerQuery = query.toLowerCase();
      const lowerTag = tagLabel.toLowerCase();

      // Find all occurrences
      let matchIndex = -1;
      let lastIndex = -1;
      let idx = lowerQuery.indexOf(lowerTag);
      while (idx !== -1) {
        lastIndex = idx;
        idx = lowerQuery.indexOf(lowerTag, idx + 1);
      }
      matchIndex = lastIndex;

      let newQuery = query;
      if (matchIndex !== -1) {
        newQuery =
          query.slice(0, matchIndex) +
          query.slice(matchIndex + tagLabel.length);
        newQuery = newQuery.replace(/\s{2,}/g, ' ').trim();
      }

      onQueryChange(newQuery);
    }
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
