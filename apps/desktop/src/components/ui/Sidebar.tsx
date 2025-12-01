import { platform } from '@tauri-apps/plugin-os';

export default function Sidebar({
  ref
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={ref}
      className={`flex flex-col w-64 p-2 h-full ${platform() === 'macos' ? 'rounded-2xl border-white dark:border-[#505050] border' : 'border-r border-r-gray-100 dark:border-r-[#505050]'}`}
    >
      {platform() === 'macos' ? (
        <>
          <div className="h-8"></div>
          <h2>Sidebar</h2>
        </>
      ) : (
        <h2>Sidebar</h2>
      )}
    </div>
  );
}
