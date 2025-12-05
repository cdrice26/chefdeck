import { platform } from '@tauri-apps/plugin-os';
import SidebarButton from './SidebarButton';

export default function Sidebar({
  ref
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={ref}
      className={`flex flex-col w-64 p-2 h-full ${platform() === 'macos' ? 'rounded-[20px] border-white dark:border-[#505050] border drop-shadow-xl bg-[#ffffffcc] dark:bg-[#202020cc]' : 'border-r border-r-gray-100 dark:border-r-[#505050]'}`}
    >
      {platform() === 'macos' ? <div className="h-8"></div> : <></>}
      <SidebarButton icon={} />
    </div>
  );
}
