import Card from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <header className="text-center p-10 min-h-[400px] background-cupcakes flex flex-col items-start justify-start w-full shadow-md rounded-lg">
        <h1 className="text-5xl font-bold text-white text-shadow">
          Welcome to ChefDeck
        </h1>
        <p className="mt-4 text-lg text-gray-100 text-shadow">
          Your ultimate recipe management tool.
        </p>
        <p className="mt-2 text-lg bg-red-400 rounded-lg text-white p-2 text-left">
          NOTICE: This project is currently in development and is not yet ready
          for production use. In additon, the backend does not have sufficient
          resources for public use at the moment, so new signups are disabled.
          It's only deployed already so I can test it out without spinning up a
          dev instance every time. Please check back later for updates.
        </p>
      </header>

      <main className="flex flex-col items-start w-full">
        <section className="py-6 w-full">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 pb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Manage Recipes
              </h2>
              <p>Easily add, edit, and delete your favorite recipes.</p>
              <Image
                src="/update.png"
                alt="Screenshot of Update Recipe Screen"
                layout="responsive"
                width={40}
                height={30}
              />
            </Card>
            <Card className="p-4 flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Schedule Meals
              </h2>
              <p>Plan your meals for the week and never run out of ideas.</p>
              <Image
                src="/schedule.png"
                alt="Screenshot of Update Recipe Screen"
                layout="responsive"
                width={40}
                height={30}
              />
            </Card>
            <Card className="p-4 flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Generate Grocery Lists
              </h2>
              <p>
                Automatically create grocery lists based on your scheduled
                meals.
              </p>
              <Image
                src="/groceries.png"
                alt="Screenshot of Update Recipe Screen"
                layout="responsive"
                width={40}
                height={30}
              />
            </Card>
            <Card className="p-4 flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Organize Recipes
              </h2>
              <p>
                Tag your recipes with relevant keywords to easily find them
                later.
              </p>
              <Image
                src="/tags.png"
                alt="Screenshot of Update Recipe Screen"
                layout="responsive"
                width={40}
                height={30}
              />
            </Card>
          </div>
        </section>

        <section className="text-center background-cutlery w-full min-h-[200px] flex flex-col items-center justify-center shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold text-white">
            Get Started Today!
          </h2>
          <p className="mt-4 text-lg text-gray-100">
            Join ChefDeck and take control of your cooking.
          </p>
          <a
            href="/signup"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Sign Up Now
          </a>
        </section>
      </main>

      <footer className="mt-10 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          &copy; 2025 ChefDeck. All rights reserved.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          ChefDeck is created by Caleb Rice. The source code is available on{' '}
          <a href="https://github.com/cdrice26/chefdeck" className="underline">
            Github
          </a>
          .
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          This project is licensed under the{' '}
          <a
            href="https://github.com/cdrice26/chefdeck/blob/main/LICENSE"
            className="underline"
          >
            MIT License
          </a>
          . It also uses third-party libraries and tools, each under their own
          license. They can be viewed{' '}
          <Link href="/licenses" className="underline">
            here
          </Link>
          . ChefDeck is one person's project and it is not affiliated with or
          endorsed by any organization.
        </p>
      </footer>
    </div>
  );
}
