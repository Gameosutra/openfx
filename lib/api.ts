import type {
  QuoteRequest,
  QuoteResponse,
  PayRequest,
  PayResponse,
  TransactionResponse,
  TransactionStatus,
} from "./types"

const QUOTE_EXPIRY_SECONDS = 30

// Simulated FX rates relative to USD
const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  INR: 83.12,
  SGD: 1.34,
  NGN: 1550.0,
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// In-memory transaction store for polling simulation
const transactions = new Map<string, TransactionResponse>()

/**
 * POST /quote
 * Returns an FX quote with rate, fees, and expiry.
 */
export async function fetchQuote(
  request: QuoteRequest
): Promise<QuoteResponse> {
  await delay(600 + Math.random() * 800) // simulate network latency

  const sourceRate = FX_RATES[request.sourceCurrency]
  const destRate = FX_RATES[request.destinationCurrency]

  if (!sourceRate || !destRate) {
    throw new Error("Unsupported currency pair")
  }

  const fxRate = destRate / sourceRate
  const fee = Math.max(request.amount * 0.005, 1.5) // 0.5% or minimum 1.5
  const totalPayable = request.amount + fee
  const destinationAmount = request.amount * fxRate

  return {
    id: generateId(),
    sourceCurrency: request.sourceCurrency,
    destinationCurrency: request.destinationCurrency,
    sourceAmount: request.amount,
    destinationAmount: Number(destinationAmount.toFixed(2)),
    fxRate: Number(fxRate.toFixed(6)),
    fee: Number(fee.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    expiresAt: Date.now() + QUOTE_EXPIRY_SECONDS * 1000,
  }
}

/**
 * POST /pay
 * Confirms payment and returns a transaction ID.
 * Simulates occasional failures (~10% failure rate).
 */
export async function submitPayment(
  request: PayRequest
): Promise<PayResponse> {
  await delay(800 + Math.random() * 1200)

  // 10% failure rate simulation
  if (Math.random() < 0.1) {
    throw new Error("Payment processing failed. Please try again.")
  }

  const transactionId = `TXN-${generateId()}`

  // Store initial transaction state
  transactions.set(transactionId, {
    id: transactionId,
    status: "processing",
    sourceCurrency: "",
    destinationCurrency: "",
    sourceAmount: 0,
    destinationAmount: 0,
    fxRate: 0,
    fee: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Simulate status progression
  simulateStatusProgression(transactionId)

  return { transactionId }
}

/**
 * Simulates the transaction moving through statuses over time.
 */
function simulateStatusProgression(transactionId: string): void {
  const statusFlow: TransactionStatus[] = ["processing", "sent", "settled"]
  let step = 0

  const interval = setInterval(() => {
    step++
    const txn = transactions.get(transactionId)
    if (!txn) {
      clearInterval(interval)
      return
    }

    // 5% chance of failure during processing
    if (step === 1 && Math.random() < 0.05) {
      txn.status = "failed"
      txn.updatedAt = new Date().toISOString()
      clearInterval(interval)
      return
    }

    if (step < statusFlow.length) {
      txn.status = statusFlow[step]
      txn.updatedAt = new Date().toISOString()
    } else {
      clearInterval(interval)
    }
  }, 3000 + Math.random() * 2000)
}

/**
 * GET /transaction/:id
 * Returns current transaction status.
 */
export async function fetchTransactionStatus(
  transactionId: string
): Promise<TransactionResponse> {
  await delay(300 + Math.random() * 500)

  const txn = transactions.get(transactionId)
  if (!txn) {
    throw new Error("Transaction not found")
  }

  return { ...txn }
}
