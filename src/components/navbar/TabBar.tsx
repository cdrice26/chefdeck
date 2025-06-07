import { Recipe } from '@/types/Recipe';
import Tab from './Tab';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchBar from './SearchBar';
import { useState } from 'react';
import { IoAdd, IoCalendar, IoHome, IoList, IoPerson } from 'react-icons/io5';
import { IoMdListBox } from 'react-icons/io';

interface TabBarProps {
  currentRecipe?: Recipe | null;
}

const TabBar = ({ currentRecipe }: TabBarProps) => {
  const url = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') ?? '');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    // Clear the previous timeout if it exists
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to update the URL after a short delay
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', newQuery);
      router.replace(url + '?' + params.toString(), {});
    }, 300); // Adjust the delay as needed

    setTypingTimeout(timeout);
  };

  return (
    <div className='flex flex-row justify-center items-center gap-4'>
      <ul className='flex flex-row justify-between items-center gap-4 bg-gray-100 rounded-full p-2 shadow-md dark:bg-[#222]'>
        <Tab
          label='Recipes'
          isActive={url === '/dashboard'}
          onClick={() => router.push('/dashboard')}
          icon={<IoHome />}
        />
        {(url === '/dashboard' || url === '/create') && (
          <Tab
            label='New Recipe'
            isActive={url === '/create'}
            onClick={() => router.push('/create')}
            icon={<IoAdd />}
          />
        )}
        {url === '/dashboard' && (
          <SearchBar
            query={query}
            onQueryChange={handleQueryChange}
            onBlur={() => {}}
          />
        )}
        {url === '/account' && (
          <Tab
            label='Account'
            isActive={true}
            onClick={() => {}}
            icon={<IoPerson />}
          />
        )}
        {currentRecipe && (
          <Tab
            label={currentRecipe.title}
            isActive={url === `/recipes/${currentRecipe.id}`}
            onClick={() =>
              (window.location.href = `/recipes/${currentRecipe.id}`)
            }
            icon={<IoMdListBox />}
          />
        )}
        <Tab
          label='Schedule'
          isActive={url === '/schedule'}
          onClick={() => router.push('/schedule')}
          icon={<IoCalendar />}
        />
        <Tab
          label='Groceries'
          isActive={url === '/groceries'}
          onClick={() => router.push('/groceries')}
          icon={<IoList />}
        />
      </ul>
    </div>
  );
};

export default TabBar;
