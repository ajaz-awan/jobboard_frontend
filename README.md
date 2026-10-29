# Jobboard — Your next chapter

Responsive Next.js, React, TypeScript frontend matched to backend v2.0.0, latest MongoDB backend archive version 2. Two coordinated Light and Dark UI designs across the full app, with a persistent accessible theme toggle. No 3D assets or morphism effects.

Start with **START_HERE.md**. Windows: double-click **START_FRONTEND.cmd**.

## Commands

```sh
npm ci --ignore-scripts
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

`npm run build:preview` creates a static export. Normal `build` + `start` includes the same-origin API proxy and security headers. Run normal `build` again before `start` if your last build was a static export.

## Configuration

`.env.example` defaults the server-side proxy to `BACKEND_URL=http://localhost:5000`. Leave `NEXT_PUBLIC_API_URL` empty. Backend `CLIENT_URL` and `FRONTEND_URL` must match the browser-facing frontend origin. Use HTTPS in production.

If using `NEXT_PUBLIC_API_URL`, supply an origin without `/api`, e.g. `https://api.example.com`. This value is public. Never put secrets in public variables. SameSite=Lax refresh cookies require same-site hosting; arbitrary unrelated frontend/API domains will not work. Prefer same-origin `/api` routing.

## Implemented features

| Area       | Interface                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts   | Candidate/employer signup, company name, login, profile editing, logo uploads                                                                             |
| Recovery   | Explicit email verification, resend, forgot/reset password, confirmation, UTF-8 password limits                                                           |
| Sessions   | In-memory access token, HttpOnly refresh cookie, CSRF header, serialized refresh, device list/revocation, logout/all                                      |
| Discovery  | Search, location, job type, work mode, experience, salary, sorting, pagination                                                                            |
| Candidates | Details, saved jobs, PDF application, cover letter, status tracking, withdrawal confirmation, private resume download                                     |
| Employers  | Own listings, create/edit, skills/deadlines, moderation state, open/close/delete, applicants, final accept/reject                                         |
| Community  | Notifications, unread filter, mark-one/all read, reports and report history                                                                               |
| Dashboard  | Server-backed application totals, listing summaries, saved jobs, unread updates                                                                           |
| Admin      | Summary, paginated jobs/users/reports/audit logs, full-content review, revision conflicts, account suspension/reactivation, recent-login reauthentication |
| Usability  | Responsive layouts, loading/errors/empty states, confirmations, semantic labels, focus styles, reduced motion                                             |

Salary uses PKR. Employers must describe monthly/yearly terms in their listing because the backend stores no salary period. Job-list responses contain no company identity; the UI never invents company names or logos.

## Routes and project structure

Record URLs use query parameters for static-preview compatibility: `/jobs/detail?id=UUID`, `/dashboard/edit-job?id=UUID`, `/dashboard/applicants?id=UUID`. Update old `/jobs/:id` links accordingly. Backend routes are unchanged.

`src/lib/api.ts` handles transport, sessions, errors and downloads. `src/context/` owns authentication. `src/features/` contains account, discovery, dashboard, editor, settings and admin screens. `src/components/` provides shared forms, workspace, icons and confirmations. `src/app/` contains route wrappers, styles and public pages. `tests/client.test.mjs` covers client transport/security behavior.

## Security decisions

- Access JWTs stay in memory. Old localStorage credentials are removed. Refresh cookies remain HttpOnly.
- Shared promises serialize refresh within a tab. Web Locks serialize it across tabs on supporting secure contexts. Failed refresh is not retried automatically. Unsupported contexts have only in-tab serialization.
- Expiring tokens refresh before requests; returned 401 clears authentication. Application submissions and other mutations are never automatically replayed after failure.
- Verification/reset fragments are removed from browser history and submitted only after explicit confirmation.
- User content renders as text, never HTML. Private resumes download through authenticated binary requests and short-lived object URLs.
- Upload controls check type/size; server validation and malware scanning remain authoritative.
- Role guards improve navigation; backend permissions enforce security. Normal job forms never send owner/moderation fields.
- Admin moderation includes reviewed revision. A 409 reloads records and requires a new review.
- Next server headers include CSP, no-referrer, nosniff, frame denial and restricted browser permissions. This static-compatible CSP uses `unsafe-inline` for Next generated scripts: it is not a complete XSS guarantee. A strict nonce policy requires request-time rendering.
- Static `_headers` hints depend on the host. Configure equivalent production headers and same-origin API routing at the edge.

## Validation and remaining deployment checks

Production/static builds, TypeScript, and seven client tests were checked during development. Browser review covers the landing page and public navigation. Tests use controlled fetch responses and do not claim a live database/browser integration check.

The user's local backend is outside this environment. Verify real cookie rotation, verification/reset email links, uploads/downloads, roles and admin actions against the running API before public launch. Static hosting does not include the Next API proxy or connect to a private localhost backend.

Privacy/terms pages describe the software. The operator must supply their legal identity, support/privacy contact, retention periods, data-rights process and jurisdiction before public operation.

The Light/Dark redesign keeps motion limited to short interaction feedback. No animation libraries or new dependencies were added; backend behavior remains unchanged.



## Light and Dark designs

The header theme button changes the entire app, including login, forms, cards, workspaces, settings and admin screens. A saved choice persists in localStorage under `jobboard-theme`; without a saved choice the initial theme follows the operating system. A constant bootstrap before the app content applies the theme before hydration to avoid a light-theme flash. Themes synchronize across tabs. Only the appearance preference is stored; access tokens remain in memory.

## Connected package validation — 29 October 2026

The combined package in the parent folder now includes `START_JOBBOARD.cmd` to start the backend, check database readiness, build and run Next.js, and confirm its same-origin API proxy. Copy your existing backend `.env` and uploaded files as explained in the parent `START_HERE.md`.

Live integration checks used the actual frontend transport (`src/lib/api.ts`), the running Next proxy, the Express server, and an isolated real MongoDB process. Ten checks passed: HTML/API routing, candidate and employer registration/verification, pending listings, admin approval/search, cookie refresh, saved jobs/PDF application, authenticated PDF download, decisions/notifications/dashboard, and logout. This supersedes the earlier note that only mocked transport had been checked. Your Windows installation and browser interactions still need a local check.

Resource loading now ignores aborted/stale responses and hides results belonging to an old query. The job editor initializes its form from the loaded listing without effect-driven resets. TypeScript, lint, all seven client tests, and the normal production build passed.
