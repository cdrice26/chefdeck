# ChefDeck

This is a recipe manager app. It allows you to keep track of your recipes, assign tags to them, search through them, schedule them, and even generate your grocery list. You can add recipes manually or from the web (just please don't steal any recipes you don't have permission to use). 

## Configuration

You'll need both this and the [Python API](https://github.com/cdrice26/chefdeck-python-api) checked out. You'll then need to configure the following environment variables:

- `SUPABASE_URL` - URL of your supabase database. You can use the sql scripts in the db folder to set up the tables and procedures.
- `SUPABASE_ANON_KEY` - Your supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY` - Your supabase service role key. Used only for account deletion.
- `NEXT_PUBLIC_SITE_URL` - The URL of your website. This will be http://localhost:3000 in development.
- `PYTHON_API_URL` - URL of your Python API instance.
- `PYTHON_API_KEY` - API key for the Python API - pick something and set the API key variable in that project, then make this one the same thing.

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
