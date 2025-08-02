# ChefDeck

This is a recipe manager app. It allows you to keep track of your recipes, assign tags to them, search through them, and schedule them.

## Configuration

You'll need copies of both this and the [Python API](https://github.com/cdrice26/chefdeck-python-api). You'll then need to configure the following environment variables:

- `SUPABASE_URL` - URL of your supabase database. You can use the sql scripts in the db folder to set up the tables and procedures.
- `SUPABASE_ANON_KEY` - Your supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY` - Your supabase service role key. Used only for account deletion.
- `NEXT_PUBLIC_SITE_URL` - The URL of your website. This will be http://localhost:3000 in development.

## Running a Dev Server

This is a Next.js app, so assuming you have the Python API running following the instructions in that repo, all you need to do is run the npm project:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
