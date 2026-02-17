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

/** Explicit quote state machine — no boolean flag explosion. */
export type QuoteState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: QuoteResponse; expiresAt: number }
  | { status: "expired"; data: QuoteResponse; expiresAt: number }
  | { status: "error"; message: string }

export type PayRequest = {
  quoteId: string
}

export type PayResponse = {
  transactionId: string
}

export type TransactionStatus =
  | "processing"
  | "sent"
  | "settled"
  | "failed"

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
