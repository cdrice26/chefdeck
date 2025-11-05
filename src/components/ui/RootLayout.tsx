'use client';

import { usePathname } from 'next/navigation';
import BottomNavigation from '../navbar/BottomNavigation';
import Navbar from '../navbar/Navbar';
import NotificationWrapper from '../notifications/NotificationWrapper';

export default function RootLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div
      className={`w-screen h-screen relative flex flex-col ${pathname === '/' ? 'background-cupcakes' : ''}`}
    >
      <NotificationWrapper />
      <Navbar />
      <div className="flex-grow pb-16 sm:pb-0 relative">{children}</div>
      <BottomNavigation />
    </div>
  );
}
