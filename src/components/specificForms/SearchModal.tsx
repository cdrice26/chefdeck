import React from 'react';
import Button from '../forms/Button';
import Modal from '@/components/ui/Modal';
import SearchBarRenderer from '../navbar/SearchBarRenderer';
import removeTagPrefixesFromQuery from '@/utils/searchUtils';

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
      className='bg-white dark:bg-[#222] w-[90%] justify-center items-center overflow-y-auto'
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
