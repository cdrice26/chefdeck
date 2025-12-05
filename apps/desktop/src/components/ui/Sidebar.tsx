import { platform } from '@tauri-apps/plugin-os';
import SidebarButton from './SidebarButton';
import { IoCalendar, IoHome, IoList } from 'react-icons/io5';
import { useState } from 'react';

export default function Sidebar({
  ref
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const [selectedPage, setSelectedPage] = useState('Recipes');

  const pages = [
    {
      label: 'Recipes',
      icon: IoHome,
      onClick: () => setSelectedPage('Recipes')
    },
    {
      label: 'Schedule',
      icon: IoCalendar,
      onClick: () => setSelectedPage('Schedule')
    },
    {
      label: 'Groceries',
      icon: IoList,
      onClick: () => setSelectedPage('Groceries')
    }
  ];

  return (
    <div
      ref={ref}
      className={`flex flex-col w-64 p-2 h-full ${
        platform() === 'macos'
          ? 'rounded-[20px] border-white dark:border-[#505050] border drop-shadow-xl bg-[#ffffffcc] dark:bg-[#202020cc]'
          : 'border-r border-r-gray-100 dark:border-r-[#505050]'
      }`}
    >
      {platform() === 'macos' ? <div className="h-8"></div> : <></>}
      <div className="flex flex-col gap-1">
        {pages.map((page) => (
          <SidebarButton
            key={page.label}
            icon={page.icon}
            label={page.label}
            onClick={page.onClick}
            selected={selectedPage === page.label}
          />
        ))}
      </div>
    </div>
  );
}
