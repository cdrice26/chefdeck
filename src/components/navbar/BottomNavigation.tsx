'use client';

import { useAuth } from '@/context/AuthContext';
import TabBar from './TabBar';

/**
 * BottomNavigation component.
 *
 * Renders a bottom navigation bar (mobile-only) that displays the `TabBar`
 * when a user is authenticated. This component is hidden on large screens
 * via the `lg:hidden` utility class and is fixed to the bottom of the viewport
 * on small devices.
 *
 * @component
 * @returns {JSX.Element | null} The bottom navigation element when a user is present, otherwise null.
 *
 * @example
 * // <BottomNavigation />
 */
const BottomNavigation = () => {
  const { user } = useAuth();
  return user ? (
    <div className="fixed lg:hidden bottom-0 p-4 flex justify-center items-center w-full">
      <TabBar />
    </div>
  ) : null;
};

export default BottomNavigation;
