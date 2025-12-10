import { platform } from '@tauri-apps/plugin-os';
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosPerson,
  IoIosSearch
} from 'react-icons/io';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router';

export default function Toolbar() {
  const navigate = useNavigate();

  return (
    <div
      data-tauri-drag-region={platform() === 'macos'}
      className={`sticky flex flex-row items-center justify-between z-10 ${
        platform() !== 'macos' ? 'bg-white dark:bg-[#202020] shadow-md' : ''
      }`}
    >
      <div
        className={`p-1 h-full flex gap-2 justify-center items-center ${
          platform() === 'macos'
            ? 'rounded-full border border-white dark:border-[#303030] bg-[#fefefe] dark:bg-[#151515] drop-shadow-2xl'
            : ''
        }`}
      >
        <button
          className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-[#505050] flex justify-center items-center"
          onClick={() => navigate(-1)}
        >
          <IoIosArrowBack className="pointer-events-none text-black dark:text-white" />
        </button>
        <button
          className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-[#505050] flex justify-center items-center"
          onClick={() => navigate(1)}
        >
          <IoIosArrowForward className="pointer-events-none text-black dark:text-white" />
        </button>
      </div>
      <div className="flex h-full flex-row gap-2 items-center justify-center">
        <div
          className={`p-1 h-full flex gap-2 justify-center items-center ${
            platform() === 'macos'
              ? 'rounded-full border border-white dark:border-[#303030] bg-[#fefefe] dark:bg-[#151515] drop-shadow-2xl'
              : ''
          }`}
        >
          <button
            className="rounded-full h-full p-1 hover:bg-gray-100 dark:hover:bg-[#505050] flex justify-center items-center"
            onClick={() => navigate('/create')}
          >
            <IoAddCircleOutline className="pointer-events-none text-black dark:text-white" />
          </button>
          <button
            className="rounded-full h-full p-1 hover:bg-gray-100 dark:hover:bg-[#505050] flex justify-center items-center"
            onClick={() => {}}
          >
            <IoIosPerson className="pointer-events-none text-black dark:text-white" />
          </button>
        </div>
        <div
          className={`p-1 h-full flex gap-2 justify-center items-center text-sm text-black dark:text-white outline-none font-light ${
            platform() === 'macos'
              ? 'rounded-full border border-white dark:border-[#303030] bg-[#fefefe] dark:bg-[#151515] drop-shadow-2xl'
              : 'rounded-lg bg-gray-100 dark:bg-[#505050]'
          }`}
        >
          <IoIosSearch className="pointer-events-none text-black dark:text-white" />
          <input
            className="py-1 pr-1 outline-none h-full"
            placeholder="Search"
            type="text"
          />
        </div>
      </div>
    </div>
  );
}
