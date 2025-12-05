import { platform } from '@tauri-apps/plugin-os';
import { IconType } from 'react-icons';

interface SidebarButtonProps {
  icon: IconType;
  label: string;
  onClick: () => void;
  selected?: boolean;
}

export default function SidebarButton({
  icon,
  label,
  onClick,
  selected
}: SidebarButtonProps) {
  const Icon = icon as any;

  return (
    <button
      className={`border-none flex flex-row items-center justify-start p-[0.3rem] px-2 gap-2 rounded-lg ${
        selected
          ? 'bg-gray-200 dark:bg-gray-700 bg-opacity-5'
          : 'bg-transparent'
      }`}
      onClick={onClick}
    >
      <Icon
        className={
          selected
            ? platform() === 'macos' && 'text-blue-500'
            : 'text-black dark:text-white'
        }
      />
      <span
        className={`font-light text-sm ${
          selected && platform() === 'macos'
            ? 'text-blue-500'
            : 'text-black dark:text-white'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
