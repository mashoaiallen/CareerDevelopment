# Allen — Electrical Engineering career development

A React and TypeScript career-development workspace for Allen, a third-year Electrical Engineering student at Wits in 2026. It combines a career portfolio with a local task and evidence tracker. The initial technical focus is Control Engineering, with a longer-term direction toward Electrical & Instrumentation Management.

The starter content is intentionally conservative: development tasks begin as **Not Started**, planned projects have no claimed results, skill levels begin as **Not assessed**, and dates and evidence remain blank until entered.

## Run the application

```bash
npm install
npm run dev
```

Vite serves the application at the local URL shown in the terminal. Use Vite or another tool that compiles the React and TypeScript entry point. A static Live Server preview of `index.html` alone does not compile TSX modules.

Create a production build with:

```bash
npm run build
npm run preview
```

## Main areas

- **Home** — career direction, data-derived counts, upcoming work, projects, dated updates, and separate completed/incomplete task views.
- **Career roadmap** — ten development stages, competency/evidence guidance, editable dates and tasks linked to each stage.
- **Technical skills** — editable current and target levels, related work, review dates, next actions and evidence.
- **Projects** — searchable project library and editable case studies, tasks, reports, evidence, dates and publication status.
- **Learning & research** — study records, sources, activity types, notes, projects and structured technical reports.
- **Leadership** — five progressive levels and editable evidence-based reflections.
- **My work** — shared task creation, scheduling, status, filters, sorting, dependencies, skills and completion history.
- **About** — editable professional profile and local-to-portfolio export workflow.

## Tasks and dates

Tasks have one shared record, even when shown on the Home page, Roadmap, My Work or a project. Use **Start**, **Complete**, and **Reopen** actions to record status transitions. Starting and completing a task records the local date and time. Reopening keeps the prior completion timestamp and adds a status-history entry.

Planned start and target completion dates/times are separate from actual start and completion dates/times. Dates are optional. An incomplete task is labelled overdue only when it has a target date in the past. A date passing never completes a task automatically.

Task completion does not change a skill assessment. Update skill proficiency yourself and link evidence that supports the assessment.

## Evidence and local storage

Record metadata and small settings are saved in `localStorage`. Uploaded file contents are stored in IndexedDB, separately from the metadata. The upload limit is 20 MB per file; supported images, reports, data files and source formats can be previewed or downloaded where appropriate. The browser does not execute uploaded code or analyse engineering evidence.

Local records and files:

- are available only in the browser profile that created them;
- do not sync to another browser or device;
- can be removed if that browser’s stored data is cleared;
- are not uploaded to a server by this application;
- are not automatically published when attached to a record.

The application has no login, backend, cloud file storage or secure access control. Do not treat this prototype as confidential storage. A shared browser profile can expose its local workspace to another person using that profile.

**Download metadata backup** exports the profile, tasks, roadmap dates, skills, projects, learning records, reflections, reports and evidence metadata. It does not include the uploaded file bytes. Download important evidence files individually before clearing browser data.

## Portfolio publication workflow

The deployable portfolio is maintained in the application source. Browser-local tasks, notes, profile edits and uploads do not change the deployed content. Project records have explicit **Draft / Local**, **Ready for Review**, and **Published in Portfolio** labels. Those labels do not publish content on their own.

To curate a project:

1. Complete and review its facts, personal contribution, results and evidence.
2. Set its publication status to **Ready for Review**.
3. Use **Export portfolio review handoff** on About to download selected ready/published project and report metadata.
4. Remove private notes, add approved evidence files, and manually update the public content in the source project before deploying.

The seeded professional content and initial records are in [`src/seeds.ts`](src/seeds.ts). The app layout, data types and local persistence are in `src/App.tsx`, `src/pages.tsx`, `src/model.ts` and `src/store.tsx`. New tasks, projects, skills, learning records, reports and reflections can be added through the application without editing the seed file.

## Backup and restore limits

The metadata backup is a JSON download for safekeeping. The app does not currently import or restore backups, and IndexedDB file blobs are excluded. Exported portfolio handoffs also exclude file bytes. Keep separate copies of the evidence files you intend to retain.

## Tests

Run the Playwright smoke suite with:

```bash
npm test
```

The test suite starts or reuses the Vite development server and checks task creation/scheduling/status history/reload persistence, evidence validation/upload/removal, project report entry, navigation and the mobile menu. Install the Playwright Chromium browser once with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to a compatible local Chrome/Chromium executable.

## Extending later

This version deliberately uses no backend or database. If the workspace later needs multi-device synchronisation, shared access, authentication or larger file storage, add a backend only after defining the required access and privacy model. Keep browser-local drafts and explicitly curated public content as distinct data sources.
