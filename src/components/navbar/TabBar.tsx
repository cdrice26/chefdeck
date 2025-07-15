import Tab from './Tab';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchBar from './SearchBar';
import { useState, useEffect } from 'react';
import { IoAdd, IoCalendar, IoHome, IoList, IoPerson } from 'react-icons/io5';
import { IoMdListBox } from 'react-icons/io';
import { useParams } from 'next/navigation';
import removeTagPrefixesFromQuery from '@/utils/searchUtils';

const TabBar = () => {
  const url = usePathname();
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') ?? '');
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleSearchBlur = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    if (tags.length > 0) {
      params.set('tags', tags.map((t) => t.value).join(','));
    } else {
      params.delete('tags');
    }
    router.push(url + '?' + params.toString(), { scroll: false });
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', newQuery);
      if (tags.length > 0) {
        params.set('tags', tags.map((t) => t.value).join(','));
      } else {
        params.delete('tags');
      }
      const newUrl = url + '?' + params.toString();
      if (newUrl !== window.location.href) router.replace(newUrl, {});
    }, 300);

    setTypingTimeout(timeout);
  };

  const handleTagsChange = (newTags: { label: string; value: string }[]) => {
    setTags(newTags);
    setQuery((prevQuery) => removeTagPrefixesFromQuery(prevQuery, newTags));
  };

  useEffect(() => {
    if (url !== '/dashboard') return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    if (tags.length > 0) {
      params.set('tags', tags.map((t) => t.value).join(','));
    } else {
      params.delete('tags');
    }
    router.replace(url + '?' + params.toString(), {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tags]);

  return (
    <div className='flex flex-row justify-center items-center gap-4'>
      <ul className='flex flex-row justify-between items-center gap-4 bg-gray-100/75 backdrop-blur-md rounded-full p-2 shadow-md dark:bg-[#222]/75'>
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
            tags={tags}
            onChangeTags={handleTagsChange}
            onBlur={handleSearchBlur}
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
        {url.startsWith('/recipe') && (
          <Tab
            label='Recipe'
            isActive={url.startsWith(`/recipe`)}
            onClick={() => {
              router.push(`/recipe/${id}`);
            }}
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
