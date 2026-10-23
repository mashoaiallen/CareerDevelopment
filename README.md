# Allen — Electrical Engineering portfolio

A React and TypeScript portfolio for Allen, a third-year Electrical Engineering student at Wits in 2026. Visitors can browse the portfolio without signing in. Only the administrator account `mashoaiallen@gmail.com`, signed in with email and password, can edit portfolio records or upload and remove evidence.

Portfolio records are stored in Supabase Postgres. A database trigger publishes a read-only projection for visitors and removes private evidence metadata from that projection. Private evidence files stay in the private `portfolio-evidence` bucket. Files explicitly marked public at upload go to `portfolio-public-evidence` and can be downloaded by visitors.

Starter content remains conservative: tasks begin as **Not Started**, project results are not invented, skill levels begin as **Not assessed**, and dates and evidence remain blank until entered.

## Connect Supabase

1. In Supabase SQL Editor, run the migrations in order:
   - [`supabase/migrations/20261023000000_create_workspaces_and_evidence.sql`](supabase/migrations/20261023000000_create_workspaces_and_evidence.sql)
   - [`supabase/migrations/20261023010000_public_portfolio_admin_access.sql`](supabase/migrations/20261023010000_public_portfolio_admin_access.sql)
2. Enable email/password sign-in in Supabase Auth. The administrator must use the existing Auth account with email `mashoaiallen@gmail.com`.
3. In Supabase Auth URL Configuration, set the production site URL and allow the production Vercel URL plus local development URL with the `/home` path as redirect destinations.
4. Fill in the root `.env` file:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

   The `.env` file is ignored by Git. Add the same two values to Vercel Project Settings → Environment Variables and redeploy after changes. The frontend uses only the publishable key; never put a `service_role` key in a `VITE_` variable or browser code.
5. Start the site. Visitors can enter the portfolio from the welcome page. The administrator uses the small **Administrator sign in** action and signs in with the existing email and password.

The `workspaces` table and both evidence buckets are protected by row-level policies that require the administrator email. The app has no account-creation screen. Existing evidence defaults to private; upload a new copy and choose **Public** to make it available for visitor download.

## Run locally

```bash
npm install
npm run dev
```

Use the Vite URL shown in the terminal. A static Live Server preview cannot compile the React and TypeScript entry points.

Create and inspect a production build:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import the Git repository in Vercel and use the Vite framework preset.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Project Settings → Environment Variables for the environments you deploy.
4. Add the production Vercel URL and any preview URLs you use to Supabase Auth's allowed redirect URLs. Set the production Site URL.
5. Make sure Vercel deployment protection allows public access to the production deployment.

[`vercel.json`](vercel.json) rewrites application routes to `index.html`, so deep links such as `/projects/dc-motor-pid` work after deployment.

## Main areas

- **Welcome** — introduces the portfolio and links to the public site; the administrator sign-in link is discreet.
- **Home** — career direction, progress, current work, projects and dated updates.
- **Career roadmap** — ten development stages, evidence guidance and linked tasks.
- **Technical skills** — current and target levels, related work, review dates and next actions.
- **Projects** — searchable case studies, tasks, reports, evidence and dates.
- **Learning & research** — study records, sources, activity types and technical reports.
- **Leadership** — five progressive levels and evidence-based reflections.
- **My work** — task schedules, status, filters, sorting, dependencies and completion history.
- **About** — professional profile and contact links.

## Data and access

Visitors can read portfolio records and download only evidence explicitly uploaded as public. Private evidence metadata is removed from the public database projection, and private file downloads require the administrator session. Only the administrator can update records, stage plans, profile details or evidence.

Workspace records and evidence file bytes are not stored in browser local storage or IndexedDB. Supabase Auth keeps its session in browser storage. The JSON backup contains records and evidence metadata, not uploaded file bytes.

## Tests

Run the Playwright smoke test with `npm test`. It checks public entry and verifies that visitor views do not expose record-edit controls.
