/** Quote validity period in milliseconds (30 seconds). */
export const QUOTE_EXPIRY_MS = 30_000

/** How often to poll transaction status when still processing (ms). */
export const TRANSACTION_POLL_INTERVAL_MS = 2_000

/** Interval for checking quote expiry (ms). Backend timestamp is source of truth. */
export const QUOTE_EXPIRY_CHECK_INTERVAL_MS = 1_000
