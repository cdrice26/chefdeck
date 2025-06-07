interface TabProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick, icon }: TabProps) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-lg flex flex-row items-center gap-2 text-nowrap ${
        isActive
          ? 'text-blue-600 border-blue-600 bg-gray-200 dark:bg-[#333] rounded-full'
          : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#333] transition-colors duration-200 rounded-full'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className='hidden md:inline'>{label}</span>
    </button>
  );
};

export default Tab;
