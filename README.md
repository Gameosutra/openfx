# OpenFX

A small demo app for an international transfer flow: get a quote, confirm payment, then watch the transaction status. No real money—everything is mocked.

## Getting started

Use Node 20. If you use nvm:

```bash
nvm use 20
```

Then install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000. You’ll land on the quote page. Pick currencies, enter an amount, hit “Get Quote”, then “Continue” to confirm and pay. After that you’re on the status page; it polls until the transfer shows as Settled (or Failed in the rare case the mock simulates a failure).

## What’s in the repo

**Routes.** We use separate pages instead of one page with a step index: `/quote`, `/confirm`, and `/transaction/[id]`. The transaction ID lives in the URL so you can refresh the status page and it still works.

**Quote flow.** Quote state is modeled explicitly (idle, loading, success, expired, error) so we avoid messy boolean flags. The quote expires 30 seconds after you get it; a timer on the page checks against that and flips to “expired” so you can’t continue with a stale quote. If you’re already on confirm when it expires, you get sent back to quote. Quote data is kept in Zustand and persisted to session storage so a refresh on confirm doesn’t lose it.

**Payment.** “Confirm & Pay” is a single mutation (React Query). We don’t retry on failure and we disable the button while the request is in flight so you can’t double-submit.

**Status page.** We poll the transaction until it’s in a terminal state (sent, settled, or failed). Polling runs every 2 seconds while status is still processing or sent, then stops. The backend is a few Next API routes that keep state in memory and fake the progression (processing → sent → settled) over a few seconds.

**Mock APIs.** All under `app/api/`: `POST /api/quote` returns a quote with rate and expiry, `POST /api/pay` returns a transaction ID (and sometimes simulates failure), and `GET /api/transaction/[id]` returns the current status. No database—transactions live in a module-level map, and status is derived from a “created at” timestamp so we don’t need server-side timers.

## Handy commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — run production build locally
