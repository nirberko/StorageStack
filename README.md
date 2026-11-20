# The Storage Network

The self storage community: forums for investors, operators and developers. A Deal Room for
facilities for sale, capital raises, partnerships and loans is coming soon.

Built with **Next.js 15** (App Router, Server Components, Server Actions) and **Supabase**
(Postgres, Auth, Storage, Row Level Security). The UI implements design **A2 — Classic Community,
modernized**.

## What's in it

| Area | Routes |
| --- | --- |
| Home | `/` |
| Forums (design A2) | `/forums` (topics, sort tabs, following, saved), `/forums/[id]`, `/forums/new` |
| Deal Room | `/deals` ("coming soon" placeholder) |
| Members | `/u/[id]` profiles, `/settings` |
| Admin (admins only) | `/admin/members` (search, verify, roles, suspend, delete), `/admin/topics` (add, edit, reorder, delete forum topics) |
| Other | `/search`, `/login`, `/signup`, `/tools`, `/learn`, `/guidelines` |

### Privacy model

- Counters (likes, replies) are maintained by triggers; members can only write the columns
  they own (column-level grants), so they cannot pin threads or inflate counts.
- Admins are members with `profiles.is_admin`. Admin changes go through `security definer` functions and
  RLS policies that check `is_admin()` in Postgres, so the admin panel is not the only gate. Members cannot
  set `is_admin` on themselves. Admins cannot demote, suspend or delete themselves, and must remove another
  admin's access before suspending or deleting them.

## Run it locally

Requirements: Node 20+, Docker (for the local Supabase stack).

```bash
npm install
npm run db:start          # starts Supabase locally, applies migrations and seed data
cp .env.example .env.local
# paste the API URL and publishable key (or legacy anon key) printed by db:start into .env.local
npm run dev               # http://localhost:3000
```

The seed creates sample discussions and members from the design mockups, plus demo logins
(local only): `demo@storagestack.dev` / `storagestack-demo`, and `admin@storagestack.dev` /
`storagestack-admin` for the admin panel.

Useful scripts:

- `npm run db:reset` — rebuild the local database from migrations and `supabase/seed.sql`
- `npm run db:types` — regenerate `src/lib/database.types.ts` after changing the schema
- `npm run lint`, `npm run typecheck`, `npm run build`

## Deploy

1. Create a Supabase project and link it: `npx supabase link --project-ref <ref>`.
2. Push the schema: `npx supabase db push` (do not run the seed in production).
   Then make yourself an admin in the SQL editor:
   `update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');`
3. In Supabase Auth settings set the Site URL to your domain and add `https://<domain>/auth/confirm`
   as a redirect URL.
4. Deploy the app to Cloudflare Workers (via [OpenNext](https://opennext.js.org/cloudflare)):
   - `npx wrangler login` once.
   - Put the hosted `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and
     `NEXT_PUBLIC_SITE_URL` in `.env.production.local` (or the build environment). It overrides
     `.env.local` for production builds only. They are `NEXT_PUBLIC_*`, so they are baked in at build time.
   - `npm run deploy` builds with OpenNext and uploads the worker. `npm run preview` runs the same
     build locally in the Workers runtime.
   - The custom domain (`thestorage.network`) is set in `routes` in `wrangler.jsonc`; the deploy
     creates the DNS record and certificate. The zone must be in the same Cloudflare account.

## Project layout

```
src/app/            routes, server actions (src/app/actions)
src/components/     UI: shell, forum, home, admin
src/lib/            Supabase clients, queries, config, formatting, generated DB types
supabase/           config, migrations, seed
```
