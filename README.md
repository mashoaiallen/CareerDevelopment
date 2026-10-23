# Allen — Electrical Engineering career development

A React and TypeScript workspace for Allen, a third-year Electrical Engineering student at Wits in 2026. It combines a career portfolio with a task, learning, project, and evidence tracker. Supabase Auth protects each account; Supabase Postgres stores workspace records and a private Supabase Storage bucket stores evidence files.

Starter content remains conservative: tasks begin as **Not Started**, project results are not invented, skill levels begin as **Not assessed**, and dates and evidence remain blank until entered.

## Connect Supabase

1. Create a Supabase project.
2. In Supabase SQL Editor, run [`supabase/migrations/20261023000000_create_workspaces_and_evidence.sql`](supabase/migrations/20261023000000_create_workspaces_and_evidence.sql). It creates a per-user `workspaces` table, enables row-level security, and creates the private `portfolio-evidence` bucket with a 20 MB file limit and per-user Storage policies.
3. Enable Email authentication. Configure the Supabase Auth Site URL and Redirect URLs for your local Vite URL and deployed Vercel domain. The sign-up form uses the current site origin for email confirmation.
4. Fill in the root `.env` file:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

   The `.env` file is ignored by Git. The same values can be added as Vercel project environment variables. The frontend uses only the Supabase publishable key; never put a `service_role` key in a `VITE_` variable or browser code.
5. Restart the development server and create an account or sign in. A new account gets its own starter workspace the first time it signs in.

The workspace is saved as one JSONB snapshot per Auth user. Every workspace query is filtered by the signed-in user and protected by Postgres RLS. Evidence object paths begin with the user's Auth UUID; the bucket is private, and the app creates signed links that expire after ten minutes. Supabase Auth retains the sign-in session in browser storage; workspace records and uploaded file bytes are stored in Supabase, not browser storage.

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

1. Push this project to a Git provider and import the repository in Vercel.
2. Use the Vite framework preset. The build command is `npm run build` and the output directory is `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Project Settings → Environment Variables for the environments you will deploy. Redeploy after changing them.
4. Add the production Vercel URL (and any preview URLs you will use) to Supabase Auth's allowed redirect URLs and set the production Site URL.

[`vercel.json`](vercel.json) rewrites application routes to `index.html`, so deep links such as `/projects/dc-motor-pid` work after deployment.

## Main areas

- **Home** — career direction, data-derived counts, upcoming work, projects, dated updates, and task views.
- **Career roadmap** — ten development stages, competency/evidence guidance, editable dates, and linked tasks.
- **Technical skills** — current and target levels, related work, review dates, next actions, and evidence.
- **Projects** — searchable project library, case studies, tasks, reports, evidence, dates, and publication status.
- **Learning & research** — study records, sources, activity types, notes, projects, and technical reports.
- **Leadership** — five progressive levels and editable evidence-based reflections.
- **My work** — shared task creation, scheduling, status, filters, sorting, dependencies, skills, and completion history.
- **About** — editable professional profile and workspace/review exports.

## Persistence and privacy

Workspace records are stored in the Supabase `public.workspaces` table and evidence bytes in the private `portfolio-evidence` bucket. Each account can access only its own database row and object paths under its Auth UUID. Keep the migration's RLS policies enabled. Do not change the bucket to public.

Changes sync to Supabase shortly after editing. The top bar shows sync status and errors. If a save fails, retry after checking the Supabase project and policies. The app does not use localStorage or IndexedDB for workspace records or evidence. Existing browser-local records from an older version are not imported automatically.

The **Download workspace backup** button exports record data and evidence metadata as JSON; it does not include uploaded file bytes. Evidence remains in Supabase Storage. Portfolio review handoffs exclude file bytes and do not publish content.

The deployable portfolio content remains maintained in the source project. Browser workspace data and uploaded evidence do not alter the public site automatically. Project records have **Draft / Local**, **Ready for Review**, and **Published in Portfolio** labels; changing a label does not deploy content.

## Tests

Run the Playwright smoke test with `npm test`. It checks the Supabase configuration/sign-in gate and does not write workspace data. Deeper authenticated CRUD checks should use a dedicated Supabase test account and project.

## Extending later

The current database stores one workspace snapshot per account. If multiple people need to collaborate on the same workspace, or simultaneous edits across devices become common, move records into normalized tables and add shared-workspace membership and conflict handling.
