import { Card } from 'chefdeck-shared/server';
import Link from 'next/link';
import Image from 'next/image';

function FeatureCard({
  title,
  description,
  imgPath,
  imgAlt
}: {
  title: string;
  description: string;
  imgPath: string;
  imgAlt: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      <p>{description}</p>
      <div className="flex justify-center items-center bg-white rounded-lg w-full h-full overflow-hidden">
        <Image
          src={imgPath}
          alt={imgAlt}
          layout="responsive"
          width={40}
          height={30}
        />
      </div>
    </Card>
  );
}

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
            <FeatureCard
              imgPath="/update.png"
              imgAlt="Screenshot of Update Recipe Screen"
              title="Manage Recipes"
              description="Easily add, edit, and delete your favorite recipes."
            />
            <FeatureCard
              imgPath="/schedule.png"
              imgAlt="Screenshot of Schedule Meals Screen"
              title="Schedule Meals"
              description="Plan your meals for the week and never run out of ideas."
            />
            <FeatureCard
              imgPath="/groceries.png"
              imgAlt="Screenshot of Generate Grocery Lists Screen"
              title="Generate Grocery Lists"
              description="Automatically create grocery lists based on your scheduled meals."
            />
            <FeatureCard
              imgPath="/tags.png"
              imgAlt="Screenshot of Organize Recipes Screen"
              title="Organize Recipes"
              description="Tag your recipes with relevant keywords to easily find them later."
            />
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
