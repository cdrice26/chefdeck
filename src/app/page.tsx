'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import request from '@/utils/fetchUtils';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('/api/auth/checkAuth', 'GET');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data?.data?.user) {
        router.replace('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-[#111]'>
      <Head>
        <title>ChefDeck - Manage Your Recipes</title>
        <meta
          name='description'
          content='ChefDeck helps you manage your recipes, schedule them, generate grocery lists, and organize them.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header className='text-center mb-10'>
        <h1 className='text-5xl font-bold text-gray-800 dark:text-gray-100'>
          Welcome to ChefDeck
        </h1>
        <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
          Your ultimate recipe management tool.
        </p>
      </header>

      <main className='flex flex-col items-center'>
        <section className='mb-10 p-6'>
          <h2 className='text-3xl font-semibold text-gray-800 dark:text-gray-100'>
            Features
          </h2>
          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='p-6 bg-white dark:bg-black rounded-lg shadow-md'>
              <h3 className='text-xl font-bold'>Manage Recipes</h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Easily add, edit, and delete your favorite recipes.
              </p>
            </div>
            <div className='p-6 bg-white dark:bg-black rounded-lg shadow-md'>
              <h3 className='text-xl font-bold'>Schedule Meals</h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Plan your meals for the week and never run out of ideas.
              </p>
            </div>
            <div className='p-6 bg-white dark:bg-black rounded-lg shadow-md'>
              <h3 className='text-xl font-bold'>Generate Grocery Lists</h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Automatically create grocery lists based on your scheduled
                meals.
              </p>
            </div>
            <div className='p-6 bg-white dark:bg-black rounded-lg shadow-md'>
              <h3 className='text-xl font-bold'>Organize Recipes</h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Categorize your recipes for easy access and organization.
              </p>
            </div>
          </div>
        </section>

        <section className='text-center'>
          <h2 className='text-3xl font-semibold text-gray-800 dark:text-gray-100'>
            Get Started Today!
          </h2>
          <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
            Join ChefDeck and take control of your cooking.
          </p>
          <a
            href='/signup'
            className='mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition'
          >
            Sign Up Now
          </a>
        </section>
      </main>

      <footer className='mt-10 text-center'>
        <p className='text-gray-600 dark:text-gray-400'>
          &copy; 2025 ChefDeck. All rights reserved.
        </p>
        <p className='text-gray-600 dark:text-gray-400'>
          ChefDeck is created by Caleb Rice. The source code is available on{' '}
          <a href='https://github.com/cdrice26/chefdeck' className='underline'>
            Github
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
