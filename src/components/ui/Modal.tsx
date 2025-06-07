import React from 'react';
import Input from '../forms/Input';
import Button from '../forms/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (e: string) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm'>
      <div className='bg-white p-4 rounded shadow-lg flex items-center justify-center flex-col gap-2 w-[90%]'>
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
      </div>
    </div>
  );
};

export default Modal;
