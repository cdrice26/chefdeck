interface TabProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Tab component.
 *
 * Renders a single tab button with an icon and a label. The component applies
 * distinct styles when active vs. inactive and forwards click events to the
 * provided `onClick` handler.
 *
 * Props:
 * - `label` (string): The text label displayed next to the icon.
 * - `icon` (React.ReactNode): Icon element to render before the label.
 * - `isActive` (boolean): Whether the tab is currently active; affects styling.
 * - `onClick` (function): Click handler invoked when the tab is pressed.
 *
 * @param {TabProps} props - Component props.
 * @returns {JSX.Element} A styled button acting as a navigation tab.
 *
 * @example
 * // <Tab label="Recipes" icon={<IoHome />} isActive={true} onClick={() => router.push('/dashboard')} />
 */
const Tab = ({ label, isActive, onClick, icon }: TabProps) => {
  return (
    <button
      tabIndex={0}
      className={`px-4 py-2 text-sm font-lg flex flex-row items-center gap-2 text-nowrap ${
        isActive
          ? 'text-blue-600 border-blue-600 bg-white/50 dark:bg-[#333]/50 rounded-full'
          : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-[#333]/50 transition-colors duration-200 rounded-full'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

export default Tab;
