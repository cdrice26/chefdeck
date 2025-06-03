interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-lg ${
        isActive
          ? 'text-blue-600 border-blue-600 bg-gray-200 dark:bg-[#333] rounded-full'
          : 'text-gray-500'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Tab;
