# Notes app

React + TypeScript + Vite + Tailwind note-taking app.

**Design note:** the Figma file was not reachable when this was built, so the UI follows the standard note-taking app layout (auth card, sidebar, list, editor) with the tokens in `tailwind.config.js`. Restyle by editing those tokens and the components in `src/components`.

## Run
```bash

npm install
cp .env.example .env   # optional
npm run dev            # http://localhost:5173
npm run build
```

## Backends (`src/services`)
- **Default: localStorage.** Works with no config. Accounts and notes live only in this browser, and the auth is a demo (hashed in the browser). It is not secure authentication.
- **Supabase:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (anon key only, never the service-role key). Run `supabase/schema.sql` in the SQL editor. It creates the `notes` table with row-level security so users only see their own rows. If email confirmation is enabled, sign-up tells the user to confirm, and does not log them in until they do. This path is untested.

## Features
Register/login with validation and show/hide password, create/edit/delete (with confirmation) notes, debounced autosave with save status and unload warning, search by title and content, sort by updated/created, archive, tags, empty/search-empty/loading/error states, responsive drawer sidebar and list/editor switching on mobile.

## Deploy on Vercel with Supabase (persistent users and notes)
1. Create a project at supabase.com and run `supabase/schema.sql` in the SQL editor.
2. In Supabase → Project Settings → API copy the Project URL and the `anon public` key (never the `service_role` key).
3. In Vercel → Project → Settings → Environment Variables add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy (Vite bakes them in at build time).
4. In Supabase → Authentication → URL Configuration add your Vercel URL to the allowed redirect URLs. For quick testing you can disable "Confirm email" under Providers → Email.

`vercel.json` rewrites all paths to `index.html` so client routes like `/login` work.
