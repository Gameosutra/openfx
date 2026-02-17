import type {
  QuoteRequest,
  QuoteResponse,
  PayRequest,
  PayResponse,
  TransactionResponse,
} from "./types"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

/** POST /api/quote — get FX quote with rate, fees, expiry. */
export async function fetchQuote(
  body: QuoteRequest
): Promise<QuoteResponse> {
  return request<QuoteResponse>("/api/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** POST /api/pay — confirm payment, returns transaction ID. */
export async function submitPayment(
  body: PayRequest
): Promise<PayResponse> {
  return request<PayResponse>("/api/pay", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** GET /api/transaction/[id] — current transaction status (for polling). */
export async function fetchTransactionStatus(
  transactionId: string
): Promise<TransactionResponse> {
  return request<TransactionResponse>(`/api/transaction/${transactionId}`)
}
