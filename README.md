# OpenFX

Simulated international FX transfer flow: get a quote, confirm payment, track transaction status.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Zustand** — quote state (explicit state machine)
- **TanStack Query (React Query)** — async flows (quote mutation, pay mutation, transaction polling)
- **Mock API routes** — `/api/quote`, `/api/pay`, `/api/transaction/[id]`

## Architecture

- **Feature-based routing**: `/quote`, `/confirm`, `/transaction/[id]` (no single-page step index).
- **Quote state** is a discriminated union: `idle` | `loading` | `success` (with `data`, `expiresAt`) | `expired` | `error` — no boolean flag explosion.
- **Expiry** is driven by backend timestamp; a 1s timer checks `Date.now() > expiresAt` and transitions to `expired`. Continue is disabled when expired.
- **Payment** uses a React Query mutation with `retry: 0`; button is disabled via `mutation.isPending` to prevent double submit.
- **Transaction status** uses React Query with `refetchInterval` when `status === "processing"`, and stops when `sent` / `settled` / `failed`.
- **URL-driven state**: transaction ID in URL so refresh on the transaction page refetches current status.

## Edge cases handled

- Quote expires while user waits → timer transitions to `expired`; continue disabled.
- Quote expires on confirm screen → timer detects expiry, store transitions to `expired`, redirect to `/quote`.
- Double-click pay → gated by `mutation.isPending` (no double submit).
- Network failure → error message and retry (quote/pay); transaction polling retries with React Query.
- Transaction fails → status shows "Failed" with Try Again / Contact Support.
- User refreshes transaction page → ID in URL; query fetches current status (stateless).
- Polling stops when status is `sent`, `settled`, or `failed`.

## Run

```bash
nvm use 20
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/quote`).

## Possible improvements

- Idempotency keys for payment.
- Exponential backoff for polling.
- WebSockets instead of polling for status.
- Retry strategy and optimistic UI.
- Accessibility labels and integration tests.
- Analytics events.
