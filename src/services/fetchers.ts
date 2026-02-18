import { fetchQuote, submitPayment, fetchTransactionStatus } from "@/lib/api"

/** Quote fetcher — POST /api/quote */
export const quoteFetcher = fetchQuote

/** Pay fetcher — POST /api/pay */
export const payFetcher = submitPayment

/** Transaction status fetcher — GET /api/transaction/[id] */
export const transactionFetcher = fetchTransactionStatus
