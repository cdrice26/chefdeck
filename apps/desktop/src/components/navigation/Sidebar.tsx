import { platform } from '@tauri-apps/plugin-os';
import SidebarButton from './SidebarButton';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { IoIosCalendar, IoIosHome, IoIosList } from 'react-icons/io';
import { OptionType, useAvailableTags } from 'chefdeck-shared';
import { request } from '../../utils/fetchUtils';
import { useEffect, useState } from 'react';

export default function Sidebar({
  ref
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { availableTags } = useAvailableTags(request);
  const [selectedTags, setSelectedTags] = useState<OptionType[]>([]);
  const [_searchParams, setSearchParams] = useSearchParams();

  const pages = [
    {
      label: 'Recipes',
      icon: IoIosHome
    },
    {
      label: 'Schedule',
      icon: IoIosCalendar
    },
    {
      label: 'Groceries',
      icon: IoIosList
    }
  ];

  const handlePageChange = (label: string) => {
    navigate(`/${label === 'Recipes' ? '' : label.toLowerCase()}`);
  };

  const handleTagChange = (tag: OptionType) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      tags: selectedTags.map((t) => t.value).join(',')
    }));
  }, [selectedTags, setSearchParams]);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-4 w-64 p-2 h-full ${
        platform() === 'macos'
          ? 'rounded-[20px] border-white dark:border-[#505050] border drop-shadow-2xl bg-[#ffffffaa] dark:bg-[#202020aa]'
          : 'border-r border-r-gray-100 dark:border-r-[#505050]'
      }`}
    >
      {platform() === 'macos' ? <div className="h-6"></div> : <></>}
      <div className="flex flex-col gap-1">
        {pages.map((page) => (
          <SidebarButton
            key={page.label}
            icon={page.icon}
            label={page.label}
            onClick={() => handlePageChange(page.label)}
            selected={
              location.pathname === `/${page.label.toLowerCase()}` ||
              (location.pathname === '/' && page.label === 'Recipes')
            }
          />
        ))}
      </div>
      <div className="flex flex-row flex-wrap gap-2 h-full overflow-y-auto p-2">
        {availableTags?.map((tag: OptionType) => (
          <button
            key={tag.value}
            className={`px-2 py-1 transition-all ${selectedTags.includes(tag) ? 'bg-green-800' : 'bg-gray-100 dark:bg-[#505050]'} rounded-lg text-sm`}
            onClick={() => handleTagChange(tag)}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
