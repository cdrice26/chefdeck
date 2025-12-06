import { platform } from '@tauri-apps/plugin-os';
import SidebarButton from './SidebarButton';
import { IoCalendar, IoHome, IoList } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router';

export default function Sidebar({
  ref
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    {
      label: 'Recipes',
      icon: IoHome
    },
    {
      label: 'Schedule',
      icon: IoCalendar
    },
    {
      label: 'Groceries',
      icon: IoList
    }
  ];

  const handlePageChange = (label: string) => {
    navigate(`/${label === 'Recipes' ? '' : label.toLowerCase()}`);
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col w-64 p-2 h-full ${
        platform() === 'macos'
          ? 'rounded-[20px] border-white dark:border-[#505050] border drop-shadow-xl bg-[#ffffffaa] dark:bg-[#202020aa]'
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
            onClick={() => handlePageChange(page.label)}
            selected={
              location.pathname === `/${page.label.toLowerCase()}` ||
              (location.pathname === '/' && page.label === 'Recipes')
            }
          />
        ))}
      </div>
    </div>
  );
}
