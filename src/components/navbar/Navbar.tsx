'use client';

import { useAuth } from '@/context/AuthContext';
import useIsDark from '@/hooks/useIsDark';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TabBar from './TabBar';
import request from '@/utils/fetchUtils';

const UserDropdown = dynamic(() => import('./UserDropdown'), { ssr: false });

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const isDark = useIsDark();
  const router = useRouter();
  const pathname = usePathname();

  const { user, username, setUsername, fetchUser } = useAuth();

  const logout = async () => {
    const response = await request('/api/auth/logout', 'POST');
    if (response.status !== 200) throw new Error('Logout failed');
    setUsername(null);
    localStorage.clear();
    await fetchUser();
    router.push('/');
  };

  const handleAccountClick = () => {
    if (user) {
      router.push('/account');
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showShadow =
    !scrolled &&
    !(
      pathname.startsWith('/recipe') &&
      !pathname.endsWith('/schedule') &&
      !pathname.endsWith('/edit')
    );
  const buttonClasses =
    'shadow-md rounded-full p-4 px-6 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-nowrap';

  return (
    <nav
      className={`sticky z-100 top-0 p-5 relative flex flex-row justify-between transition-shadow items-center ${
        showShadow ? 'shadow-lg' : ''
      }`}
    >
      <button
        tabIndex={0}
        onClick={() => router.push('/')}
        className={
          !showShadow
            ? 'rounded-full dark:bg-[#222]/75 bg-gray-100/75 backdrop-blur-md h-full shadow-md'
            : '' + 'transition-all'
        }
      >
        <img
          src={isDark ? '/logo-darktheme.png' : '/logo.png'}
          className='h-12'
          alt='Cooky'
        />
      </button>
      {user && (
        <div className='hidden lg:flex'>
          <TabBar />
        </div>
      )}
      <div className='flex flex-row gap-4'>
        {user ? (
          <UserDropdown
            user={{ ...user, username: username ?? user.email }}
            onClickAccount={handleAccountClick}
            onClickLogout={logout}
          />
        ) : (
          <>
            <button
              className={buttonClasses}
              tabIndex={0}
              onClick={() => {
                router.push('/login');
              }}
            >
              Log In
            </button>
            <button
              className={buttonClasses}
              tabIndex={0}
              onClick={() => {
                router.push('/signup');
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
