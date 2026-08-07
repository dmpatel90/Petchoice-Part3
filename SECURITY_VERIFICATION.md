# Security Verification Report

This report responds directly to the Part 4 feedback: it replaces claims without
evidence with exact routes, exact HTTP status codes, and how each result was
checked. Every check below was run against a **real** PostgreSQL database and a
**real** running instance of `server.js` — not a mock, and not just a code
read-through.

**⚠️ Action required before you redeploy — read this first.** `server.js` now
refuses to start at all if `SESSION_SECRET` is not set (see Fix 1 below). Before
you push these changes, add `SESSION_SECRET` to your Vercel project's
**Settings → Environment Variables** (Production), or the live site will go
down on the next deploy. Generate a value with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a *different* random value than whatever you put in your local `.env`.

---

## 1. Fixes made in response to feedback

| # | Issue raised | Fix | File |
|---|---|---|---|
| 1 | Hard-coded fallback session secret (`secret: process.env.SESSION_SECRET \|\| "petchoice-secret-key"`) | Removed the fallback entirely. The app now calls `process.exit(1)` at startup if `SESSION_SECRET` is missing, so a misconfiguration is caught immediately instead of silently running with a known, guessable secret. | `server.js` |
| 2 | Secret must live only in environment variables | `SESSION_SECRET` is read only from `process.env`; there is no default anywhere in the codebase. `.env` is git-ignored; `.env.example` only ever contains placeholders. | `server.js`, `.env`, `.gitignore` |
| 3 | Production sessions must be persistent, not `MemoryStore` | Sessions are stored in Postgres via `connect-pg-simple` (the `session` table), not in server memory. Verified below — see §2.5. | `server.js` |
| 4 | Helmet's CSP must be configured, not disabled | `contentSecurityPolicy` is a scoped directive object (`default-src 'self'`, explicit allow-list for fonts/CDN/images), not `false`. Verified below — see §2.2. | `server.js` |
| 5 | Logout must demonstrably destroy the session | `req.session.destroy()` removes the row from the Postgres `session` table (confirmed by direct SQL query, not just by the cookie disappearing), and the response now also explicitly clears the `petchoice.sid` cookie and logs any destroy error instead of swallowing it. | `server.js` |
| 6 | Leaked real database credential in `.env.example` | Replaced with a placeholder. **The real credential was exposed in this file — rotate the Neon database password** (Neon console → your project → reset the role password) and update `DATABASE_URL` in Vercel and your local `.env` once rotated. | `.env.example` |
| 7 | Reported login variable-name errors | Re-checked `server.js`'s login route, `models/index.js`, and `seedUsers.js` line by line. No naming mismatches remain (the `useDeferredValueser`/`Userser` bug from an earlier phase was already corrected and re-verified here — confirmed absent via a full-repo grep). | — |

No optional features (registration, change password, dashboard stats) were
touched in this pass — this round was scoped entirely to the reliability and
security items above, per the feedback.

---

## 2. Evidence — checked locally against a real Postgres database and a real running server

Setup: a throwaway local PostgreSQL 16 instance, migrated with the project's
own `migrate.js`, seeded with the project's own `seedUsers.js`
(`admin@petchoice.com` / `viewer@petchoice.com`), then `node server.js` run
as a real process and driven with `curl` (cookie jars, no shortcuts). Full
raw command transcript available on request; summarized here as a table.

### 2.1 Startup fails without `SESSION_SECRET` (evidence for Fix 1 & 2)

```
$ SESSION_SECRET= node server.js
❌ SESSION_SECRET is not set. Add it to your .env file (local) or your
   Vercel project's Environment Variables (production) before starting
   the server.
exit code: 1
```

### 2.2 Content-Security-Policy header is present (evidence for Fix 4)

```
GET /login →
Content-Security-Policy: default-src 'self'; base-uri 'self';
  font-src 'self' https://fonts.gstatic.com data:; form-action 'self';
  frame-ancestors 'self'; img-src 'self' data: https:; object-src 'none';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; ...
```

### 2.3 Anonymous users are denied on protected routes

| Route | Method | Actor | Expected | Actual | Status |
|---|---|---|---|---|---|
| `/breeds` | GET | anonymous | 302 → `/login` | 302 | ✅ Verified |
| `/breeds/add` | GET | anonymous | 302 → `/login` | 302 | ✅ Verified |
| `/admin/dashboard` | GET | anonymous | 302 → `/login` | 302 | ✅ Verified |
| `/change-password` | GET | anonymous | 302 → `/login` | 302 | ✅ Verified |

### 2.4 Viewer is denied on admin-only routes, via direct URL (evidence for the "viewer denial" requirement)

Tested by direct URL access — not just hidden nav links — with a **valid,
session-matched CSRF token** on every POST, so the 403 below is proven to be
the `requireAdmin` authorization check and not a CSRF rejection.

| Route | Method | Actor | Expected | Actual | Status |
|---|---|---|---|---|---|
| `/breeds` | GET | viewer | 200 (read access allowed) | 200 | ✅ Verified |
| `/breeds/add` | GET | viewer | 403 | 403 | ✅ Verified |
| `/breeds/add` | POST (valid CSRF) | viewer | 403 "Administrator access required" | 403, body confirmed | ✅ Verified |
| `/breeds/:id/edit` | GET | viewer | 403 | 403 | ✅ Verified |
| `/breeds/:id/edit` | POST (valid CSRF) | viewer | 403 "Administrator access required" | 403, body confirmed | ✅ Verified |
| `/breeds/:id/delete` | POST (valid CSRF) | viewer | 403 "Administrator access required" | 403, body confirmed | ✅ Verified |

Database check after all five viewer attempts above: no new or modified
breed rows existed — confirmed with a direct `SELECT` against the `breeds`
table, not just by trusting the HTTP status code.

### 2.5 Admin CRUD works end-to-end against the real database

| Route | Method | Actor | Expected | Actual | Status |
|---|---|---|---|---|---|
| `/breeds/add` | POST | admin | 302, row created | 302; `SELECT` confirmed the row | ✅ Verified |
| `/breeds/:id/edit` | POST | admin | 302, row updated | 302; `SELECT` confirmed new value | ✅ Verified |
| `/breeds/:id/delete` | POST | admin | 302, row removed | 302; `SELECT` returned 0 rows | ✅ Verified |

### 2.6 Logout destroys the session (evidence for Fix 5 & persistent-store requirement)

| Check | Expected | Actual | Status |
|---|---|---|---|
| `GET /logout` | 302 | 302 | ✅ Verified |
| Response includes `Set-Cookie` clearing `petchoice.sid` | cookie cleared (`Expires` in the past) | confirmed in raw response headers | ✅ Verified |
| Reusing the *same* pre-logout cookie against `/admin/dashboard` | 302 → `/login` (session no longer valid) | 302 | ✅ Verified |
| Row for that session in the Postgres `session` table, before vs. after logout | present before, **absent** after | queried by session content (`sess::text LIKE '%admin@petchoice.com%'`) — 1 row before, 0 rows after | ✅ Verified — this is the proof the session was destroyed server-side in the persistent store, not just that the cookie was cleared client-side |

---

## 3. What still needs to be verified against the live Vercel deployment

Everything in §2 was run against a real database and a real server process,
but it was a local instance — not the actual production deployment. An AI
sandbox environment cannot reach `petchoice-part3.vercel.app` directly (no
general outbound network access), so this last step has to be run by you.

Run `verify-production.js` (included in this repo) from your own machine:

```
node verify-production.js
```

It runs the exact same 16 checks as §2.3–§2.6 above, but against the live URL,
and prints a pass/fail line for each one plus a final `N/16 checks passed`
summary. It's safe to run against production — the one test breed it creates
is always deleted again at the end, even if a later step fails.

**Before running it the first time:**
1. Set `SESSION_SECRET` in Vercel (see the warning at the top of this file) and redeploy.
2. Confirm `admin@petchoice.com` / `viewer@petchoice.com` exist in the production database (run `npm run migrate` and `node seedUsers.js` against production once, if you haven't already — see the README's Installation section).

Paste the script's output into this section (or bring it to the presentation)
as your production evidence.

```
(paste `node verify-production.js` output here once you've run it against
petchoice-part3.vercel.app)
```
