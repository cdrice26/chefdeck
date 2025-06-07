import React from 'react';
import Input from '../forms/Input';
import Button from '../forms/Button';
import Modal from '@/components/ui/Modal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (e: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange
}) => {
  if (!isOpen) return null;

  return (
    <Modal className='bg-white w-[90%] justify-center items-center'>
      <Input
        className='px-4 py-2 w-full text-sm'
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onQueryChange(e.target.value)
        }
        placeholder='Search'
        style={{ fontSize: '16px' }} // Set font size to prevent zoom on mobile
      />
      <Button onClick={onClose}>Close</Button>
    </Modal>
  );
};

export default SearchModal;
