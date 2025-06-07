import React, { useState } from 'react';
import { IoSearch } from 'react-icons/io5'; // Import the search icon
import Modal from '@/components/ui/Modal'; // Import the Modal component

interface SearchBarProps {
  query: string;
  onQueryChange: (e: string) => void;
  onBlur: () => void;
}

const SearchBar = ({ query, onQueryChange, onBlur }: SearchBarProps) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleIconClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    onBlur(); // Call onBlur when closing the modal
  };

  return (
    <div>
      {/* Desktop Search Bar */}
      <div className='hidden md:flex'>
        <input
          className={`px-4 py-2 flex-grow text-sm font-lg active:text-blue-600 active:border-blue-600 bg-gray-200 dark:bg-[#333] active:rounded-full 
            text-gray-500 hover:bg-gray-200 dark:hover:bg-[#333] transition-colors duration-200 rounded-full`}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onQueryChange(e.target.value)
          }
          onBlur={onBlur}
          placeholder='Search'
        />
      </div>

      {/* Mobile Search Icon */}
      <div className='md:hidden text-gray-500'>
        <button onClick={handleIconClick} className='p-2'>
          <IoSearch />
        </button>
      </div>

      {/* Modal for Search Input */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        query={query}
        onQueryChange={onQueryChange}
      />
    </div>
  );
};

export default SearchBar;
