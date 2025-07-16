'use client';

import { useAuth } from '@/context/AuthContext';
import TabBar from './TabBar';

const BottomNavigation = () => {
  const { user } = useAuth();
  return user ? (
    <div className='fixed lg:hidden bottom-0 p-4 flex justify-center items-center w-full'>
      <TabBar />
    </div>
  ) : (
    <></>
  );
};

export default BottomNavigation;
