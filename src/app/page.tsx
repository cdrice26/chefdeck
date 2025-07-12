import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-[#111]'>
      <header className='text-center mb-10'>
        <h1 className='text-5xl font-bold text-gray-800 dark:text-gray-100'>
          Welcome to ChefDeck
        </h1>
        <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
          Your ultimate recipe management tool.
        </p>
        <p className='mt-2 text-lg text-red-500'>
          NOTICE: This project is currently in development and is not yet ready
          for production use. In additon, the backend does not have sufficient
          resources for public use at the moment, so new signups are disabled.
          Please check back later for updates.
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
                Tag your recipes for easy access and organization.
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
        <p className='text-gray-600 dark:text-gray-400'>
          This project is licensed under the{' '}
          <a
            href='https://github.com/cdrice26/chefdeck/blob/main/LICENSE'
            className='underline'
          >
            MIT License
          </a>
          . It also uses third-party libraries and tools, each under their own
          license. They can be viewed{' '}
          <Link href='/licenses' className='underline'>
            here
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
