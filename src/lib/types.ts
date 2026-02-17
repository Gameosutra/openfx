export type Currency = {
  code: string
  name: string
  symbol: string
  flag: string
}

export type QuoteRequest = {
  sourceCurrency: string
  destinationCurrency: string
  amount: number
}

export type QuoteResponse = {
  id: string
  sourceCurrency: string
  destinationCurrency: string
  sourceAmount: number
  destinationAmount: number
  fxRate: number
  fee: number
  totalPayable: number
  expiresAt: number // timestamp in ms
}

/** Quote state status – single source of truth for type-safe checks. */
export const QuoteStatus = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Expired: "expired",
  Error: "error",
} as const
export type QuoteStatusValue = (typeof QuoteStatus)[keyof typeof QuoteStatus]

/** Explicit quote state machine — no boolean flag explosion. */
export type QuoteState =
  | { status: typeof QuoteStatus.Idle }
  | { status: typeof QuoteStatus.Loading }
  | { status: typeof QuoteStatus.Success; data: QuoteResponse; expiresAt: number }
  | { status: typeof QuoteStatus.Expired; data: QuoteResponse; expiresAt: number }
  | { status: typeof QuoteStatus.Error; message: string }

export type PayRequest = {
  quoteId: string
}

export type PayResponse = {
  transactionId: string
}

/** Transaction status – single source of truth for type-safe checks. */
export const TransactionStatusValue = {
  Processing: "processing",
  Sent: "sent",
  Settled: "settled",
  Failed: "failed",
} as const
export type TransactionStatus =
  (typeof TransactionStatusValue)[keyof typeof TransactionStatusValue]

export type TransactionResponse = {
  id: string
  status: TransactionStatus
  sourceCurrency: string
  destinationCurrency: string
  sourceAmount: number
  destinationAmount: number
  fxRate: number
  fee: number
  createdAt: string
  updatedAt: string
}

/** For step indicator / navigation. */
export type AppStep = "quote" | "confirm" | "status"
